import React from "react";
import { withRouter } from "react-router-dom";

class ResourceEntry extends React.Component {
  constructor() {
    super();
    this.viewResource = this.viewResource.bind(this);
  }

  viewResource() {
    this.props.history.push("/resource/view=" + String(this.props.content._id));
  }

  render() {
    return (
      <div>
        <h6>
          <a onClick={this.viewResource}>{this.props.content.title}</a>
        </h6>
        {this.props.content.content.substring(0, 200) + "..."}
      </div>
    );
  }
}

export default withRouter(ResourceEntry);
