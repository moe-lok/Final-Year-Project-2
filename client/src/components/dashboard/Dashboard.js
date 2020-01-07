import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import Quagga from 'quagga'; // ES6
import axios from 'axios';
import {Container, Row, Col, Table, Button, Form} from 'react-bootstrap'
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

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

      this.state = {
        entries: [],
        bonlinkentry: [],
      };
    }

    componentDidMount(){
      axios.get('/api/entries/').then(response => {
        this.setState({ entries: response.data })
      }).catch((error) => {
        console.log(error)
      })

      axios.get('/api/bonlink/').then(response => {
        this.setState({ bonlinkentry: response.data })
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

  exportTable = () =>{
    var wb = XLSX.utils.table_to_book(document.getElementById('mytable'), {sheet:"FCI"});

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, "FCI" + fileExtension);
  }

  entryList(){
      return this.state.entries.map(currententry => {
          return <tr key={currententry._id}>
          <td>{currententry.machineId}</td>
          <td>{currententry.materialId}</td>
          <td>{currententry.In}</td>
          <td>{currententry.Out}</td>
          <td>{new Date(currententry.updatedAt).toLocaleDateString()}</td>
          <td>{new Date(currententry.updatedAt).toLocaleTimeString()}</td>
          {this.state.bonlinkentry.map(bonlink => {
            if(bonlink.machineId == currententry.machineId && bonlink.outMaterialId == currententry.materialId){
              return <React.Fragment key={bonlink._id}>

                <td>{bonlink.materialIdA}</td>
                <td>{bonlink.InA}</td>
                <td>{bonlink.materialIdB}</td>
                <td>{bonlink.InB}</td>
              </React.Fragment>
            }
          })}
      </tr>;
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
                <Container>
                  <Row>
                    <Col>
                      <Button onClick={this.onLogoutClick}>Logout</Button>
                    </Col>
                    <Col>
                      <Button onClick={this.onScanBarcode}>Scan</Button>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <Button onClick={this.toConfPage}>Conf Machines</Button>
                    </Col>
                    <Col>
                      <Button onClick={this.exportTable}>Export</Button>
                    </Col>
                  </Row>
                </Container>
                <table className="table" id="mytable">
                    <thead>
                        <tr>
                          <th scope="col">Machine Id</th>
                          <th scope="col">Material Id</th>
                          <th scope="col">In</th>
                          <th scope="col">Out</th>
                          <th scope="col">Date</th>
                          <th scope="col">Time</th>
                          <th scope="col">MatId A</th>
                          <th scope="col">In A</th>
                          <th scope="col">MatId B</th>
                          <th scope="col">In B</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.entryList()}
                    </tbody>
                </table>
            </div>
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