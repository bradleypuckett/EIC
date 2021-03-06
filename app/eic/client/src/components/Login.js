import React, { Component } from "react";
import { GoogleLogin } from "react-google-oauth";
import TokenService from "./TokenService";
import UserTypeService from "./UserTypeService";
import config from "../config.json";

class Login extends Component {
  constructor() {
    super();
    this.tokenService = new TokenService();
    this.userTypeService = new UserTypeService();
  }

  componentWillMount() {
    if (this.tokenService.loggedIn()) {
      this.props.history.replace("/");
    }
  }

  render() {
    return (
      <div>
        <center>
          <div>
            <h1>Log In Here</h1>
          </div>
          <div>
            <GoogleLogin onLoginSuccess={this.executeLogin} />
          </div>
        </center>
      </div>
    );
  }

  executeLogin = response => {
    const tokenBlob = new Blob(
      [
        JSON.stringify(
          { access_token: response.getAuthResponse().access_token },
          null,
          2
        )
      ],
      { type: "application/json" }
    );
    const options = {
      method: "POST",
      body: tokenBlob,
      mode: "cors",
      cache: "default"
    };
    fetch(config.BASE_URL + "/googleapi/v1/auth/google-login", options).then(
      r => {
        if (r.ok) {
          const token = r.headers.get("x-auth-token");
          r.json().then(user => {
            if (token) {
              this.userTypeService.setUserType(r.headers.get("x-user-type"));
              this.tokenService.setToken(token);
              this.props.history.replace("/");
            }
          });
        } else {
          if (r.status === 406) {
            this.props.history.replace("/register");
          }
        }
      }
    );
  };
}

export default Login;
