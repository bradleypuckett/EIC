import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

class ECStore extends EventEmitter {
  constructor() {
    super();
    this.searchResults = [];
    this.sentRequests = [];
  }

  getSearchResults() {
    return this.searchResults;
  }

  requestNotSent(email) {
    if (this.sentRequests.indexOf(email) >= 0) {
      return false;
    }
    return true;
  }

  handleActions(action) {
    switch (action.type) {
      case "RECEIVE_BUDDY_SEARCH": {
        this.searchResults = action.resources;
        this.emit("change");
        break;
      }
      case "REMOVE_BUDDY_SEND": {
        this.sentRequests.push(action.email);
        this.emit("change");
        break;
      }
      default:
        break;
    }
  }
}

const ecStore = new ECStore();
dispatcher.register(ecStore.handleActions.bind(ecStore));

export default ecStore;
