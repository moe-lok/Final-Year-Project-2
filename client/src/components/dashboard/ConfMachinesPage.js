import React, {Component} from "react"
import {Container, Row, Col, Table, Button, Form, ListGroup} from 'react-bootstrap'
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import axios from 'axios';

const SortableItem = SortableElement(({value}) => <li>{value}</li>);



class ConfMachinesPage extends Component {
    constructor(props){
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this)
        this.state = {machines: []}
    }

    componentDidMount(){
        axios.get('/api/confmach/').then(response => {
            this.setState({ machines: response.data })
        }).catch((error) => {
            console.log(error)
        })
        console.log(this.state.machines.lenght)
    }

    _back = () => {
        window.location = '/dashboard';
    }

    _addMach = () => {
        window.location = '/addmachpage';
    }

    _save = () => {
        console.log("save button is pressed")
    }

    state = {
        items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
    };
    
    onSortEnd = ({oldIndex, newIndex}) => {
        this.setState(({items}) => ({
          items: arrayMove(items, oldIndex, newIndex),
        }));
    };

    machines(type){
        return this.state.machines.map((currmachine, i) =>{
            if (currmachine.machineType == type){
                return <ListGroup.Item key={i}>
                    id:{currmachine.machineId+" "}  
                    name:{currmachine.machineName+" "} 
                    order:{currmachine.ordering+" "}
                    index:{i}
                </ListGroup.Item>
            }
        });
    }


    render(){
        var divStyle = {
            margin: 20,
        }

        return(
            <div>
                <Button variant="outline-secondary" style={divStyle} onClick={this._back}>back</Button>
                <Container style={divStyle}>
                    <Row>
                        <Col><h4>Configuration Machines</h4></Col>
                        <Col>
                            <Button onClick={this._save}>save</Button>
                        </Col>
                        <Col>
                            <Button onClick={this._addMach}>add</Button>
                        </Col>
                    </Row>
                </Container>

                
                {/*<SortableList items={this.state.items} onSortEnd={this.onSortEnd} />*/}
                
                <ListGroup>
                    <ListGroup.Item>
                        <p>SAW</p>
                        <ListGroup>
                            {this.machines("SAW")}
                        </ListGroup>
                    </ListGroup.Item>
                    <ListGroup.Item>
                    <p>COVERLAYER</p>
                        <ListGroup>
                            {this.machines("CVL")}
                        </ListGroup>
                    </ListGroup.Item>
                    <ListGroup.Item>
                    <p>BONDER</p>
                        <ListGroup>
                            {this.machines("BON")}
                        </ListGroup>
                    </ListGroup.Item>
                    <ListGroup.Item>
                    <p>POST BONDER</p>
                        <ListGroup>
                            {this.machines("PBON")}
                        </ListGroup>
                    </ListGroup.Item>
                    <ListGroup.Item>
                    <p>OLE</p>
                        <ListGroup>
                            {this.machines("OLE")}
                        </ListGroup>
                    </ListGroup.Item>
                </ListGroup>
            </div>
        )
    }
}

export default ConfMachinesPage