import React, { Component } from "react";
import { Link } from "react-router-dom";
import logo from "../../media/hewlett-packard-logo-black-and-white.png"
import "bootstrap/dist/css/bootstrap.min.css"

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
          collapsed: true,
        };
      }
      toggleNavbar() {
        this.setState({
          collapsed: !this.state.collapsed,
        });
      }

  render() {
    const collapsed = this.state.collapsed;
    const classOne = collapsed ? 'collapse navbar-collapse' : 'collapse navbar-collapse show';
    const classTwo = collapsed ? 'navbar-toggler navbar-toggler-right collapsed' : 'navbar-toggler navbar-toggler-right';
    return (
        <nav className="navbar navbar-light navbar-expand-lg" style={{backgroundColor: "#e3f2fd"}}>
            <a className="navbar-brand" href="#">
            <img src={logo} width="30" height="30" className="d-inline-block align-top" alt="boi"/>
            FCI
            </a>
            <button  onClick={this.toggleNavbar} className={`${classTwo}`} type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon" />
            </button>
            <div className={`${classOne}`} id="navbarResponsive">
                <ul className="navbar-nav mr-auto">
                    <li className="navbar-item">
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/scanpage" className="nav-link">Scan</Link>
                    </li>
                    <li className="navbar-itm">
                      <Link to="/confmachpage" className="nav-link">Conf</Link>
                    </li>
                </ul>

            </div>
        </nav>
    );
  }
}
export default Navbar;