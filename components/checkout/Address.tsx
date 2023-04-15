const Address = (props: {
  title: string;
  state: string;
  country: string;
  address: string;
}) => (
  <li className="flex-grow min-w-[45%]">
    <span className="title">
      <b>{props.title}</b>
    </span>
    <div className="address">{props.address}</div>
    <div className="state">
      State/County:{" "}
      <i>
        <b>{props.state}</b>
      </i>
    </div>
    <div className="country">
      Country/Region:{" "}
      <i>
        <b>{props.country}</b>
      </i>
    </div>
  </li>
);

export default Address;
