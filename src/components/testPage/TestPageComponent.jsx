"use client";
import Script from "next/script";

export default function DemoPage() {
  return (
    <>
      {/* Load jQuery + Bootstrap js */}
      <Script
        src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"
        strategy="afterInteractive"
      />

      {/* Load your old JS files */}
      <Script src="/hslib.js" strategy="afterInteractive" />
      <Script src="/demo.js" strategy="afterInteractive" />
      <Script src="/neo.js" strategy="afterInteractive" />

      {/* Bootstrp CSS */}
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"
      />

      <div className="container-fluid">
        <h1>Subscribing to HSM demo</h1>
        <p>You can use this page to get live broadcast, pause, resume etc.</p>

        {/* Token Section */}
        <div className="row">
          <div
            className="col-sm-12"
            style={{ backgroundColor: "MediumSeaGreen" }}
          >
            Token <input type="text" id="token_id" />
            <br />
            SID <input type="text" id="sid" />
            <br />
            Data Center
            <select id="datacenter_id">
              <option value="gdc">gdc</option>
              <option value="gdcd">gdcd</option>
              <option value="adc">adc</option>
              <option value="e21">E21</option>
              <option value="e22">E22</option>
              <option value="e41">E41</option>
              <option value="e43">E43</option>
            </select>
            <br />
          </div>
        </div>

        {/* Channel Actions */}
        <div className="row text-primary">
          <div className="col-sm-3">
            Do Action on Channel # <br />
            <input type="text" id="channel_number" defaultValue="1" />
            <br />
            <br />
            <input
              type="button"
              id="connect_hsm"
              className="bg-info"
              value="Connect HSM"
              onClick={() => window.wconnect("Hsm")}
            />
            <input
              type="button"
              id="connect_hsi"
              value="Connect HSI"
              onClick={() => window.wconnect("Hsi")}
            />
            <br />
            <br />
            Channels <br />
            <input
              type="button"
              id="pause_channel"
              className="bg-danger"
              value="Pause"
              onClick={() =>
                window.resumeandpause(
                  "cp",
                  document.getElementById("channel_number").value
                )
              }
            />
            <input
              type="button"
              id="resume_channel"
              className="bg-success"
              value="Resume"
              onClick={() =>
                window.resumeandpause(
                  "cr",
                  document.getElementById("channel_number").value
                )
              }
            />
          </div>

          {/* Subscribe Blocks */}
          <div className="col-sm-3">
            Stream for Scrips <br />
            <textarea
              id="sub_scrips"
              defaultValue="nse_cm|11536&nse_cm|1594&nse_cm|3456"
            />
            <br />
            <input
              type="button"
              value="Subscribe Scrip"
              onClick={() => window.wsub("mws", "sub_scrips", "")}
            />
          </div>

          <div className="col-sm-3">
            Stream Indices <br />
            <textarea
              id="sub_indices"
              defaultValue="nse_cm|Nifty 50&nse_cm|Nifty Realty"
            />
            <br />
            <input
              type="button"
              value="Subscribe Index"
              onClick={() => window.wsub("ifs", "sub_indices", "")}
            />
          </div>

          <div className="col-sm-3">
            Stream MD <br />
            <textarea
              id="sub_depth"
              defaultValue="nse_cm|11536&nse_cm|11000&nse_cm|11001"
            />
            <br />
            <input
              type="button"
              value="Subscribe Depth"
              onClick={() => window.wsub("dps", "sub_depth", "")}
            />
          </div>
        </div>

        {/* Streaming output */}
        <div className="row">
          <div className="col-sm-3">&nbsp;</div>
          <div className="col-sm-9">
            Streaming ... Scrips
            <br />
            <textarea id="stream_scrips" rows={10} cols={100}></textarea>
            <br />
            Streaming ... Orders
            <br />
            <textarea id="stream_scrips1" rows={10} cols={100}></textarea>
          </div>
        </div>

        <hr />
        <p>
          For HandshakeServerId - Call POST
          https://lhsi.kotaksecurities.com/quick/user/handshake?sId=server34
        </p>
      </div>
    </>
  );
}
