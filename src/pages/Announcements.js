import React from "react";
import underConstruction from "../images/underconstruction.png";


class Announcements extends React.Component {

  constructor(props) {
    super(props);
  }


  componentDidMount() {
  }

  render() {
    return (
      <>
      <div style={{textAlign:"center", marginTop: "24px"}}>
        <h3>Announcements</h3>
      </div>
      <div style={{textAlign:"center"}}>
        <img src={underConstruction} alt="Page Under Construction" style={{height:"50%", width:"50%"}}/>
      </div>
      </>
    );
  }
}

export default Announcements;