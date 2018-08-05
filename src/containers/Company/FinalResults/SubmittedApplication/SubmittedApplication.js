import React, { Component } from "react";
import ResultsHeader from "../ResultsHeader";
import Spinner from "../../../../components/UI/Spinner/Spinner";
import "./SubmittedApplication.css";

class SubmittedApplication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isError: false,
      data: {}
    };
    this.ApplicantId = this.props.match.params.ApplicantId;
  }

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (token === null) {
      this.setState({
        isLoading: false,
        isError: true
      });
      return;
    }

    const options = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    fetch(
      `http://localhost:4567/api/applicant/applicant/${this.ApplicantId}`,
      options
    )
      .then(
        res => (res.status === 403 ? Promise.reject("Auth denied") : res.json())
      )
      .then(data => {
        console.log("DATA FROM SUBMITTED APPLICATION", data);
        this.setState({
          data,
          isLoading: false
        });
      })
      .catch(err => console.error(err));
  }

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    }

    let { data } = this.state;

    let isOver18 = data.hasOwnProperty("over18")
      ? data.over18
        ? "Yes"
        : "No"
      : "Unknown";

    let isLegal = data.hasOwnProperty("legal")
      ? data.legal
        ? "Yes"
        : "No"
      : "Unknown";

    let felon = data.hasOwnProperty("felon")
      ? data.felon
        ? "Yes"
        : "No"
      : "Unknown";

    let felonyForm = data.hasOwnProperty("felonyForm")
      ? data.felon
        ? data.felonyForm
        : null
      : "Unknown";

    let education = data.hasOwnProperty("education")
      ? data.education.length > 0
        ? this.state.data.education.map(edu => (
            <div key={edu.id} style={{ borderTop: "solid gray 2px" }}>
              <p>
                <strong>School:</strong> {edu.school}
              </p>
              <p>
                <strong>Study:</strong> {edu.study}
              </p>
              <p>
                <strong>Degree:</strong> {edu.degree}
              </p>
              <p>
                <strong>Program Description:</strong> {edu.description}
              </p>
              <p>
                <strong>Start Date:</strong> {edu.startTime}
              </p>
              <p>
                <strong>End Date:</strong>{" "}
                {edu.current ? "Current" : edu.endTime}
              </p>
            </div>
          ))
        : "None"
      : "Unknown";

    let workExperience = data.hasOwnProperty("workExperience")
      ? data.workExperience.length > 0
        ? data.workExperience.map(exp => (
            <div key={exp.id} style={{ borderTop: "solid gray 2px" }}>
              <p>
                <strong>Company Name:</strong> {exp.company}
              </p>
              <p>
                <strong>Company Industry:</strong> {exp.industry}
              </p>
              <p>
                <strong>Position Title:</strong> {exp.title}
              </p>
              <p>
                <strong>Position Description:</strong> {exp.description}
              </p>
              <p>
                <strong>Reason For Leaving:</strong> {exp.leaving}
              </p>
              <p>
                <strong>Start Date:</strong> {exp.startTime}
              </p>
              <p>
                <strong>End Date:</strong>{" "}
                {exp.current ? "Current" : exp.endTime}
              </p>
            </div>
          ))
        : "None"
      : "Unknown";

    return (
      <div>
        <div className="resultsnav">
          <ResultsHeader ApplicantId={this.ApplicantId} />
        </div>
        <div className="resultsheaderapp">
          <h1>{this.state.data.firstName}'s Application</h1>
          <div className="row">
            <div className="col-md-12">
              <div className="card card-body bg-light mb-3">
                <h3>Personal Information</h3>
                <p>
                  <strong>First Name:</strong> {this.state.data.firstName}
                </p>
                <p>
                  <strong>Last Name:</strong> {this.state.data.lastName}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {this.state.data.address || "Unknown"}
                </p>
                <p>
                  <strong>City:</strong> {this.state.data.city || "Unknown"}
                </p>
                <p>
                  <strong>State:</strong> {this.state.data.state || "Unknown"}
                </p>
                <p>
                  <strong>ZIP Code:</strong>{" "}
                  {this.state.data.zipCode || "Unknown"}
                </p>
                <p>
                  <strong>Primary Contact:</strong>{" "}
                  {this.state.data.phone || "Unknown"}
                </p>
                <p>
                  <strong>Email:</strong> {this.state.data.email}
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="card card-body mb-2">
                <h3>Education</h3>
                {education}
              </div>
            </div>
            <div className="col-md-6">
              <div className="card card-body mb-2">
                <h3>Employment History</h3>
                {workExperience}
              </div>
            </div>
          </div>
          <div className="card card-body mb-2">
            <h3>Applicant Details</h3>
            <p>
              <strong>Cover Letter:</strong>{" "}
              {this.state.data.coverLetter || "None"}
            </p>
            <p>
              <strong>Salary Requirements:</strong>{" "}
              {this.state.data.salaryRequirements || "None"}
            </p>
            <p>
              <strong>Is The Candidate Over The Age of 18:</strong> {isOver18}
            </p>
            <p>
              <strong>
                Is The Candidate Legally Allowed to Work in This State:
              </strong>{" "}
              {isLegal}
            </p>
            <p>
              <strong>Does the candidtate have any felony offenses:</strong>{" "}
              {felon}
            </p>
            {data.felon ? (
              <span>
                <p>
                  <strong>Description of offenses:</strong> {felonyForm}
                </p>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default SubmittedApplication;
