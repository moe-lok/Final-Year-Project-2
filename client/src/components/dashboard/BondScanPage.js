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
        this.onOutSubmit = this.onOutSubmit.bind(this);

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
            results: '',
            In: 0,})
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

    // delete material recursively
    materialRemove(total, machineId, category){
        console.log("inside materialRemove function ######")
        var t = total

        axios.post('/api/bon/delinc',{machineId: machineId, materialCategory: category}).then(bon => {
            console.log('searching for next last bonder entry ######')
            console.log(bon.data)
            console.log(bon.data._id)
            if(t > bon.data.In){
                console.log("total > In  ######")
                axios.post('/api/bon/delinc1/' + bon.data._id).then(res => {
                    console.log("deleting the bonder ######")
                    t = t - bon.data.In
                    console.log(t)
                    this.materialRemove(t, machineId, category);
                }).catch((error) => {
                    console.log(error)
                })
            }else if(t <= bon.data.In){
                console.log("total <= In  ######")
                axios.post('/api/bon/delinc2/'+ bon.data._id, {total: -t}).then(res => {
                    console.log("decrementing the bonder ######")
                    t = 0
                    console.log(t)
                }).catch((error) => {
                    console.log(error)
                })
            }

        }).catch((error) => {
            console.log(error)
        })
        console.log("t is 0 ######")
        console.log(t)
    }

    onOutSubmit(e){
        e.preventDefault();
        console.log("OUT submit button is pressed")
        // this.state.Out, this.state.outMaterialId
        // submit to bonder entry
        const bon = {
            machineId: this.state.bonderId,
            materialCategory: this.state.materialCategory,
            materialId: this.state.results,
            In: this.state.In,
            outMaterialId: this.state.outMaterialId,
            Out: this.state.Out,
        }

        console.log(bon)
        // add to bonder entry
        axios.post('/api/bon/add', bon)
        .then(res => {
            console.log(res.data)

            const entry = {
                machineId: this.state.bonderId,
                materialId: this.state.outMaterialId,
                In: this.state.In,
                Out: this.state.Out
            }
    
            console.log(entry);
            
            // submit to entry
            axios.post('/api/entries/add', entry)
            .then(res => {
                console.log(res.data)

                // delete from each material input
                if(this.state.QtyA == this.state.expectedOut){
                    console.log("attempting to delete all bon material A #######")
                    const del = {
                        machineId: this.state.bonderId,
                        materialCategory: "A"
                    }

                    // delete all from material A
                    axios.post('/api/bon/deletematerial', del)
                    .then(resp => {
                        console.log(resp.data)
                        // delete partially from material B
                        this.materialRemove(this.state.QtyA, this.state.bonderId, "B")
                        window.location = '/dashboard';
                    }).catch((error) => {
                        console.log(error)
                    })

                }else if(this.state.QtyB == this.state.expectedOut){
                    console.log("attempting to delete all bon material B #######")
                    const del = {
                        machineId: this.state.bonderId,
                        materialCategory: "B"
                    }
                    
                    // delete all from material B
                    axios.post('/api/bon/deletematerial', del)
                    .then(res => {
                        console.log(res.data)
                        // delete partially from material A
                        this.materialRemove(this.state.QtyB, this.state.bonderId, "A")
                        window.location = '/dashboard';
                    }).catch((error) => {
                        console.log(error)
                    })
                }

                
            }).catch((error) => {
                console.log(error)
            })

        }).catch((error) => {
            console.log(error)
        })

    }

    materialRow(cat){
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

    scanningWindow(){
        var divStyle = {
            margin: 20,
        }
        return(
            <div>
                {!(this.state.results.length || this.state.outMaterialId.length) &&
                    <button className="btn btn-primary" style={divStyle} onClick={this._scan}>
                    {this.state.scanning ? 'Stop' : 'Start'}
                    </button>
                }
                <Scanner onDetected={this._onDetected} /> 
            </div>
        );
    }

    materialTable(){
        return(
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
                                {this.materialRow("A")}
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
                                {this.materialRow("B")}
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
            </Container>
        );
    }

    formIn(){
        return(
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
        );
    }

    scanMaterialOut(){
        var divStyle = {
            margin: 20,
        }
        if(this.state.outMaterialId.length){
            return(
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
                        <Form onSubmit={this.onOutSubmit}>
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
                </div>
            );
        }else{
            return(null);
        }
    }

    scanMatOutButton(){
        return(
            <Row>
                <Col>
                <Button onClick={() => this._scan("OUT")} variant="primary" size="sm">
                    Scan Mat Out
                </Button>
                </Col>
            </Row>
        );
    }

    formOut(){
        var divStyle = {
            margin: 20,
        }
        return(
            <div>
                {this.scanMaterialOut()}
                {this.scanMatOutButton()}
            </div>
        );
    }

    mainBody(){
        var divStyle = {
            margin: 20,
        }
        return(
            <div>
                <Button variant="outline-secondary" style={divStyle} onClick={this._back}>back</Button>
                <h1>This is Bonder {this.state.bonderId}</h1>
                <Container>
                    {this.materialTable()}
                    {this.state.results ? 
                    this.formIn()
                    :
                    this.formOut()
                    }
                </Container>
  
                <h1>Bonder Scan Page</h1>
            </div>
        );
    }

    render(){
        var divStyle = {
            margin: 20,
        }

        return(
            <div>
                {this.state.scanning ?
                this.scanningWindow()
                : 
                this.mainBody()
                }
                
            </div>
        )
    }
}

export default BondScanPage