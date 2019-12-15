import React, {Component} from "react"
import {Container, Row, Col, Table, Button, Form,
Dropdown, DropdownButton} from 'react-bootstrap'
import Scanner from './Scanner'
import Result from './Result'
import axios from 'axios';


class AddMachinePage extends Component {
    constructor(props){
        super(props);
        this._scan = this._scan.bind(this);
        this._rescan = this._rescan.bind(this);
        this._onDetected = this._onDetected.bind(this);
        this.dropdownMachType = this.dropdownMachType.bind(this);
        this.onChangedMachineName = this.onChangedMachineName.bind(this);
        this.onChangedMachineOrder = this.onChangedMachineOrder.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        
        this.state = {
            scanning: false,
            results: [],
            machineType:'',
            machineName:'',
            order:'',
        }
    }

    _back = () => {
        window.location = "/confmachpage";
    }

    _scan = () => {
        this.setState({ scanning: !this.state.scanning })
    }

    _rescan = () => {
        this.state.results.pop()
        this.setState({ results: this.state.results})
        this._scan()
    }

    _onDetected = result => {
        this.setState({ results: this.state.results.concat([result]) })
        this.setState({ scanning: !this.state.scanning })
    }

    dropdownMachType = (type) => {
        console.log(type)
        this.setState({machineType: type})

    }

    onChangedMachineName(e){
        this.setState({
            machineName: e.target.value
        })
    }

    onChangedMachineOrder(e){
        this.setState({
            order: e.target.value
        })
    }

    onSubmit(e){
        e.preventDefault();
        console.log("submit button is pressed")
        const confMach = {
            machineType: this.state.machineType,
            machineId: this.state.results[0].codeResult.code,
            machineName: this.state.machineName,
            ordering: this.state.order,
        }

        console.log(confMach)
        axios.post('/api/confmach/add', confMach)
        .then(res => {console.log(res.data)
            window.location = '/confmachpage';
        })
    }

    render(){
        var divStyle = {
            margin: 20,
        }

        return(
            <div>
                <Button variant="outline-secondary" style={divStyle} onClick={this._back}>back</Button>
                <h2 style={divStyle}>Add Machine Page</h2>
                {!this.state.results.length &&
                    <button className="btn btn-primary" style={divStyle} onClick={this._scan}>
                    {this.state.scanning ? 'Stop' : 'Start'}
                    </button>
                }

                <ul className="list-group">
                    {this.state.results.map((result, i) => (
                        <Result key={result.codeResult.code + i} result={result} index={i}/>
                    ))}
                </ul>

                {this.state.scanning ? <Scanner onDetected={this._onDetected} /> : null}

                {(this.state.results.length > 0) && 
                    <div>
                        <button type="button" className="btn btn-primary" style={divStyle} onClick={this._rescan}>retake</button>
                        <Form  style={divStyle} onSubmit={this.onSubmit}>
                            <Container>
                                <Row>
                                    <Col>
                                        <DropdownButton id="dropdown-item-button" title="Machine Types">
                                            <Dropdown.Item as="button" type="button" onClick={() => this.dropdownMachType("SAW")}>SAW</Dropdown.Item>
                                            <Dropdown.Item as="button" type="button" onClick={() => this.dropdownMachType("CVL")}>CVL</Dropdown.Item>
                                            <Dropdown.Item as="button" type="button" onClick={() => this.dropdownMachType("BON")}>BON</Dropdown.Item>
                                            <Dropdown.Item as="button" type="button" onClick={() => this.dropdownMachType("PBON")}>Post BON</Dropdown.Item>
                                            <Dropdown.Item as="button" type="button" onClick={() => this.dropdownMachType("OLE")}>OLE</Dropdown.Item>
                                        </DropdownButton>
                                    </Col>
                                    <Col>
                                        <h3>{this.state.machineType} is selected</h3>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Group controlId="machineName">
                                            <Form.Label>Machine Name</Form.Label>
                                            <Form.Control onChange={this.onChangedMachineName} 
                                            type="text" placeholder="Enter any Name" />
                                            <Form.Text className="text-muted">
                                            Name is for display purpose only.
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="orderNumber">
                                            <Form.Label>ordering</Form.Label>
                                            <Form.Control onChange={this.onChangedMachineOrder}
                                            type="number" placeholder="Enter ordering number" />
                                            <Form.Text className="text-muted">
                                            Please enter number only.
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Button type="submit">submit</Button>
                                </Row>
                            </Container>
                        </Form>
                    </div>
                }

            </div>
        )
    }
}

export default AddMachinePage