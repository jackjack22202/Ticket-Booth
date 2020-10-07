import React from "react";
import underConstruction from "../library/images/underconstruction.png";


class Announcements extends React.Component {

  render() {
    return (
      <>
      <div style={{textAlign:"center"}}>
        <img src={underConstruction} alt="Page Under Construction" style={{height:"50%", width:"50%"}}/>
      </div>
      </>
    );
  }
}

export default Announcements;