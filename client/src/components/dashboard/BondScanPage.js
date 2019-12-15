import React, {Component} from "react"
import {Container, Row, Col, Table, Button, Form} from 'react-bootstrap'
import Scanner from './Scanner'
import axios from 'axios'

class BondScanPage extends Component {
    constructor(props){
        super(props)
        this._scan = this._scan.bind(this);
        this._onDetected = this._onDetected.bind(this);
        this.resultCode = this.resultCode.bind(this);
        this.onChangedIn = this.onChangedIn.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.onChangedYieldOutput = this.onChangedYieldOutput.bind(this);

        this.state = {
            bonderId: '',
            results: '',
            materialCategory:'',
            In:0,
            outMaterialId:'',
            Out:0,
            bonEntries:[],
            QtyA:0,
            QtyB:0,
            expectedOut:0,
            rejectAmt: 0,
        }
    }


    componentDidMount(){
        console.log("component did mount")
        console.log(this.props.location.state.bonderId)

        this.setState({
            bonderId: this.props.location.state.bonderId
        })
        
        let bonderId = this.props.location.state.bonderId

        axios.get('api/bon/bonderfind/'+ bonderId).then(response => {
            console.log(response.data)
            if(response.data != null){
                this.setState({bonEntries: response.data})

                this.state.bonEntries.map((entry, i) => {

                    if(entry.materialCategory == "A"){
                        this.setState({QtyA: this.state.QtyA + entry.In})
                    }else{
                        this.setState({QtyB: this.state.QtyB + entry.In})
                    }
                })

                this.setState({
                    expectedOut: Math.min(this.state.QtyA, this.state.QtyB)
                })
            }
        }).catch((error) => {
            console.log(error)
        })

        

    }

    _back = () => {
        window.location = '/scanpage';
    }

    _scan = (matCat) => {
        if(matCat != "OUT"){
            this.setState({materialCategory: matCat,
            results: ''})
            this.setState({ scanning: !this.state.scanning })
        }else if(matCat == "OUT"){
            this.setState({ materialCategory: '',
            outMaterialId: '',
            Out: this.state.expectedOut - this.state.rejectAmt})
            this.setState({ scanning: !this.state.scanning })
        }
        
    }

    _onDetected = result => {
        if(this.state.materialCategory == ''){
            this.setState({
                results: '',
                outMaterialId: result.codeResult.code,
                scanning: !this.state.scanning
            })
        }else if (this.state.materialCategory != ''){
            this.setState({ results: result.codeResult.code })
            this.setState({ scanning: !this.state.scanning })
            console.log(this.state.results)
        }
        
    }

    resultCode(){
        if (!this.state.results) {
            return null
        }

        return(
            <h5>material code: {this.state.results}</h5>
        )
    }

    outResultCode(){
        if (!this.state.outMaterialId) {
            return null
        }

        return(
            <h5>out material code: {this.state.outMaterialId}</h5>
        )
    }

    onChangedIn(e){
        this.setState({
            In: e.target.value
        })
    }

    onChangedYieldOutput(e){

        this.setState({
            Out: this.state.expectedOut - e.target.value,
            rejectAmt: e.target.value
        })
    }

    onSubmit(e){
        e.preventDefault();
        console.log("submit button is pressed")
        const bon = {
            machineId: this.state.bonderId,
            materialCategory: this.state.materialCategory,
            materialId: this.state.results,
            In: this.state.In,
            outMaterialId: this.state.outMaterialId,
            Out: this.state.Out,
        }

        console.log(bon)
        axios.post('/api/bon/add', bon)
        .then(res => {console.log(res.data)

            const entry = {
                machineId: this.state.bonderId,
                materialId: this.state.results ? this.state.results : this.state.outMaterialId,
                In: this.state.In,
                Out: this.state.Out
            }
    
            console.log(entry);
            
            axios.post('/api/entries/add', entry)
            .then(res => {console.log(res.data)
                window.location = '/dashboard';
            })
            
        })
    }

    onOutSubmit(e){
        e.preventDefault();
        console.log("OUT submit button is pressed")
    }

    material(cat){
        return this.state.bonEntries.map((entry, i) => {

            if(entry.materialCategory == cat){
                return <tr key={i}>
                <td>{i}</td>
                <td>{entry.materialId}</td>
                <td>{entry.In}</td>
                </tr>
            }
        })
    }

    render(){
        var divStyle = {
            margin: 20,
        }

        return(
            <div>
                {this.state.scanning ?
                <div>
                    {!(this.state.results.length || this.state.outMaterialId.length) &&
                        <button className="btn btn-primary" style={divStyle} onClick={this._scan}>
                        {this.state.scanning ? 'Stop' : 'Start'}
                        </button>
                    }
                    <Scanner onDetected={this._onDetected} /> 
                </div> 
                : 
                <div>
                    <Button variant="outline-secondary" style={divStyle} onClick={this._back}>back</Button>
                    <h1>This is Bonder {this.state.bonderId}</h1>
                    <Container>
                    <Row>
                        <Col>
                            <h3>Material A</h3>
                            <h3>Qty: {this.state.QtyA}</h3>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                    <th>#</th>
                                    <th>Mat Id</th>
                                    <th>Qty In</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.material("A")}
                                </tbody>
                            </Table>
                        </Col>
                        <Col>
                            <h3>Material B</h3>
                            <h3>Qty: {this.state.QtyB}</h3>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                    <th>#</th>
                                    <th>Mat Id</th>
                                    <th>Qty In</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.material("B")}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button onClick={() => this._scan("A")} variant="primary" size="sm">
                            Scan Mat A
                            </Button>
                        </Col>
                        <Col>
                            <Button onClick={() => this._scan("B")} variant="primary" size="sm">
                            Scan Mat B
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                        {this.resultCode()}
                        </Col>
                    </Row>
                    {this.state.results ? 
                    <Row>
                        <Col>
                            <Form onSubmit={this.onSubmit}>
                                <Form.Group controlId="orderNumber">
                                    <Form.Label>IN</Form.Label>
                                    <Form.Control onChange={this.onChangedIn}
                                    type="number" placeholder="Enter In number" />
                                    <Form.Text className="text-muted">
                                    Please enter number only.
                                    </Form.Text>
                                </Form.Group>
                                <Row>
                                    <Button type="submit">submit</Button>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                    :
                    <div>
                        {this.state.outMaterialId.length ? 
                            <div style={divStyle}>
                                <Row>
                                    <Col>
                                    <h4>Expected Out Qty: {this.state.expectedOut}</h4>
                                    <h4>Final Out Qty: {this.state.Out}</h4>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                    {this.outResultCode()}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                    <Form onSubmit={this.onSubmit}>
                                        <Form.Group controlId="formGroupEmail">
                                            <Form.Label>Key In Reject</Form.Label>
                                            <Form.Control onChange={this.onChangedYieldOutput} 
                                            type="number" placeholder="Please enter numbers only" />
                                        </Form.Group>
                                        <Button variant="primary" type="submit">
                                            Submit
                                        </Button>
                                    </Form>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                    <Button onClick={() => this._scan("OUT")} variant="primary" size="sm">
                                        Scan Mat Out
                                    </Button>   
                                    </Col>
                                </Row>
                            </div>
                            :
                            <Row>
                                <Col>
                                <Button onClick={() => this._scan("OUT")} variant="primary" size="sm">
                                    Scan Mat Out
                                </Button>
                                </Col>
                            </Row>
                        }
                    </div>
                    }
                    
                    </Container>

                    
                    <h1>Bonder Scan Page</h1>
                </div>
                }
                
            </div>
        )
    }
}

export default BondScanPage