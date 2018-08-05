import React, { Component } from "react";
import TextAreaFieldGroup from "../../../../components/UI/Form/TextAreaFieldGroup";
import "./Profile/Profile.css";

class ApplicationDetails extends Component {
  render() {
    return (
      <div className="profileinfo">
        <div className="subheader">
          <label>Application Details</label>
        </div>
        <div className="profileinput">
          <div style={{ padding: "20px 0px" }}>
            <label>Upload Resume: </label>
            <input type="file" onChange={this.props.fileSelectHandler} />
            <button onClick={this.props.uploadHandler}>Upload!</button>
          </div>
          <TextAreaFieldGroup
            name="coverLetter"
            placeholder="Cover Letter"
            onChange={this.props.handleChange}
            info="Please put together a cover letter describing why you would be a fit at this company"
          />
          <TextAreaFieldGroup
            name="salaryRequirements"
            placeholder="Salary Requirements"
            onChange={this.props.handleChange}
            info="Please specify any salary requirents you may have"
          />
        </div>
      </div>
    );
  }
}

export default ApplicationDetails;
