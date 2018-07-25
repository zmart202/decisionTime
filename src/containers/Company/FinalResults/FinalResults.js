import React from "react";
import Aux from "../../../hoc/Aux/Aux";
import Spinner from "../../../components/UI/Spinner/Spinner";
import ResultsHeader from "./ResultsHeader";
import "./FinalResults.css";

class FinalResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isError: false,
      data: {},
      applicants: [],
      showMultipleChoice: false
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
      `http://localhost:4567/api/company/test-results/${this.ApplicantId}`,
      options
    )
      .then(
        res => (res.status === 403 ? Promise.reject("Auth denied") : res.json())
      )
      .then(data => {
        console.log("DATA FROM FINALRESULTS", data);
        this.setState({
          data,
          isLoading: false
        });
      })
      .catch(err => console.error(err));
  }

  formattedSeconds = sec => {
    return (
      Math.floor(sec / 60) +
      " minutes and " +
      ("0" + (sec % 60)).slice(-2) +
      " seconds"
    );
  };

  showMultipleChoiceHandler = () => {
    this.setState({ showMultipleChoice: !this.state.showMultipleChoice });
  };

  render() {
    let answerData = this.state.data.answerData;
    let allMCResponses = [];
    let correctMCResponses = [];
    let ORQuestionsArray = [];
    let multipleChoiceQuestions = null;
    let style;

    if (!answerData) {
      return null;
    } else {
      answerData.map(answer => {
        if (answer.type === "MULTIPLE_CHOICE") {
          allMCResponses.push(answer);

          if (answer.correct) {
            correctMCResponses.push(answer);
          }
          return correctMCResponses;
        }

        return allMCResponses;
      });
      answerData.map(answer => {
        if (answer.type === "OPEN_RESPONSE") {
          ORQuestionsArray.push(answer);
        }

        return ORQuestionsArray;
      });
    }

    let openResponseQuestions = ORQuestionsArray.map(question => {
      return (
        <div key={question.body} className="ORquestionstyle">
          <strong>
            <em>{question.body}</em>
          </strong>
          <p>{question.answer}</p>
        </div>
      );
    });

    if (this.state.showMultipleChoice) {
      multipleChoiceQuestions = allMCResponses.map(question => {
        return (
          <div key={question.body} className="MCquestionStyle">
            <strong>
              <em>{question.body}</em>
            </strong>
            {question.options.map(option => {
              if (question.answer === option.answer && option.correct) {
                style = {
                  color: "green"
                };
              } else if (question.answer === option.answer && !option.correct) {
                style = {
                  color: "red"
                };
              } else {
                style = {};
              }
              return (
                <div key={option.id} style={style}>
                  {option.answer}
                </div>
              );
            })}
          </div>
        );
      });
    }

    let multipleChoiceButton = this.state.showMultipleChoice ? (
      <div className="MCButtonStyle">
        <a onClick={this.showMultipleChoiceHandler}>
          Hide Multiple Choice Questions
        </a>
      </div>
    ) : (
      <div className="MCButtonStyle">
        <a onClick={this.showMultipleChoiceHandler}>
          Show Multiple Choice Questions
        </a>
      </div>
    );

    let MCScore = `(${correctMCResponses.length}/${
      allMCResponses.length
    }) of the multiple choice questions were answered correctly!`;

    if (this.state.isLoading) {
      return <Spinner />;
    }

    return (
      <Aux>
        <div className="resultsheader">
          <div className="resultsnav">
            <ResultsHeader ApplicantId={this.ApplicantId} />
          </div>
          <h3 style={{ color: "purple" }} className="namedisplay">
            <strong>
              Test Results for {this.state.data.firstName}{" "}
              {this.state.data.lastName}
            </strong>
          </h3>
          <h4 style={{ color: "purple" }} className="timerdisplay">
            Total amount of time taken is{" "}
            <span style={{ color: "red", textDecoration: "underline" }}>
              {this.formattedSeconds(this.state.data.secondsElapsed)}
            </span>
          </h4>
        </div>
        <div className="MCquestionlayout">
          <h4 className="questionheader">Multiple Choice</h4>
          {MCScore}
          <br />
          {multipleChoiceButton}
          {multipleChoiceQuestions}
        </div>
        <div className="questionStyle">
          <h4 className="questionheader">Open Response</h4>
          {openResponseQuestions}
        </div>
      </Aux>
    );
  }
}

export default FinalResults;
