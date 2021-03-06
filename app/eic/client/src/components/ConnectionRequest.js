import React from "react";
import * as CRActions from "../actions/CRActions";
import CRStore from "../stores/CRStore";
import InfoBox from "./InfoBox";
import "../css/stupid.css";
import "../css/generic.css";

export default class ConnectionRequest extends React.Component {
  constructor() {
    super();
    this.getRequests = this.getRequests.bind(this);

    this.state = {
      requests: []
    };
  }

  componentWillMount() {
    //ResourcesActions.loadResources();
    CRStore.on("change", this.getRequests);
  }

  componentDidMount() {
    // To avoid reloading data if not needed when component mounts
    // Will be called first time component mounts
    // We can always call CRActions.loadRequests() when needed
    if (CRStore.isEmpty()) {
      CRActions.loadRequests();
    } else {
      this.getRequests();
    }
  }

  componentWillUnmount() {
    // Remember to do this to avoid memory leaks
    CRStore.removeListener("change", this.getRequests);
  }

  getRequests() {
    this.setState({
      requests: CRStore.getAll()
    });
  }

  render() {
    // Had to break convention; could not get style to render correctly
    // unless I did this.
    const defaultMessage = {
      marginLeft: "4%",
      color: "#999999"
    };

    return (
      <div>
        <ul className="list_container">
          {this.state.requests.map(person => (
            <InfoBox
              email={person.contact}
              biography={person.biography}
              name={person.user_name}
            />
          ))}
        </ul>
        {this.state.requests.length === 0 && (
          <p style={defaultMessage}> You have no requests at this time. </p>
        )}
      </div>
    );
  }
}
