import dispatcher from "../dispatcher";
import axios from "axios";
import config from "../config.json";

export function loadBuddySearchResults(searchText) {
  if (!searchText.length) {
    dispatcher.dispatch({ type: "RECEIVE_BUDDY_SEARCH", resources: [] });
    return;
  }
  const token = localStorage.getItem("id_token");
  try {
    axios({
      method: "get",
      url: config.BASE_URL + "/api/getBuddyPartial/" + searchText,
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const persons = res.data[0].buddy;
      dispatcher.dispatch({ type: "RECEIVE_BUDDY_SEARCH", resources: persons });
    });
  } catch (err) {
    // No matches
  }
}

export function sendRequest(buddyEmail) {
  const token = localStorage.getItem("id_token");
  try {
    axios({
      method: "get",
      url: config.BASE_URL + "/api/addPendingStudent/" + buddyEmail,
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      // if anything needs to be done after, write it here
    });
    // called in order to clear results on page - makes the UX nicer since something happens
    dispatcher.dispatch({ type: "RECEIVE_BUDDY_SEARCH", resources: [] });
    dispatcher.dispatch({ type: "REMOVE_BUDDY_SEND", email: buddyEmail });
    alert("Your connection request to " + buddyEmail + " has been sent!");
  } catch (err) {
    // No matches
  }
}
