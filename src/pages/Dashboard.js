import LoadingMask from "react-loadingmask";
import React from "react";

import ticketBooth from "../library/images/TicketBooth.gif";

const TicketBoothLogo = <img src={ticketBooth} alt="Ticket Booth Logo"/>

class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    }
  }


  componentDidMount() {
  }

  render() {
    return (
      <>
      <LoadingMask loading={this.state.loading} indicator={TicketBoothLogo} style={{display:(this.state.loading ? "block" : "none")}}>
      </LoadingMask>
      </>
    );
  }
}

export default Dashboard;