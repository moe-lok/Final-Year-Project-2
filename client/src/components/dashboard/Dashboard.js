import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import Quagga from 'quagga'; // ES6
import axios from 'axios';
import {Container, Row, Col, Table, Button, Form} from 'react-bootstrap'

const Entry = props => (
    <tr>
        <td>{props.entry.machineId}</td>
        <td>{props.entry.materialId}</td>
        <td>{props.entry.In}</td>
        <td>{props.entry.Out}</td>
        <td>{new Date(props.entry.updatedAt).toLocaleDateString()}</td>
        <td>{new Date(props.entry.updatedAt).toLocaleTimeString()}</td>
    </tr>
)

class Dashboard extends Component {
    constructor(props){
      super(props);

      this.deleteEntry = this.deleteEntry.bind(this);

      this.state = {entries: []};
    }

    componentDidMount(){
      axios.get('/api/entries/').then(response => {
        this.setState({ entries: response.data })
      }).catch((error) => {
        console.log(error)
      })
    }

    deleteEntry(id){
        axios.delete('/api/entries/'+id).then(res => console.log(res.data));
        this.setState({
            entries: this.state.entries.filter(el => el._id !== id)
        })
    }

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  onScanBarcode = e =>{
    this.props.history.push("/scanpage");
  }

  toConfPage = () =>{
    this.props.history.push("/confmachpage");
  }

  entryList(){
      return this.state.entries.map(currententry => {
          return <Entry entry={currententry} deleteEntry={this.deleteEntry} key={currententry._id}/>;
      })
  }

render() {
    const { user } = this.props.auth;
    var divStyle = {
      margin: 20,
    }
return (
      <div>
        <div>
          <div style={divStyle}>
            <h4>
              <b>Hey there,</b> {user.name.split(" ")[0]}
              <p className="flow-text grey-text text-darken-1">
                You are logged into tracker{" "}
                <span style={{ fontFamily: "monospace" }}>FCI</span> apps 👏
              </p>
            </h4>

            <div style={divStyle}>
                <h3>Material tracking</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Machine Id</th>
                            <th scope="col">Material Id</th>
                            <th scope="col">In</th>
                            <th scope="col">Out</th>
                            <th scope="col">Date</th>
                            <th scope="col">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.entryList()}
                    </tbody>
                </table>
            </div>

            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem",
                margin: 20
              }}
              onClick={this.onLogoutClick}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Logout
            </button>
            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem",
                margin: 20
              }}
              onClick={this.onScanBarcode}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Scan
            </button>
            <Container>
              <Row>
                <Col>
                  <Button onClick={this.toConfPage}>Conf Machines</Button>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { logoutUser }
)(Dashboard);