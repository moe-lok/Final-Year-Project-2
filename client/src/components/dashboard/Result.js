import React, { Component } from 'react'

class Result extends Component {
  render() {
    const result = this.props.result
    const index = this.props.index

    if (!result) {
      return null
    }

    return (
      <li className="list-group-item">
        {' '}
        {result.codeResult.code} [{result.codeResult.format}] : {(index%2==0)?"machine id": "material id"}{' '}
      </li>
    )
  }
}

export default Result
