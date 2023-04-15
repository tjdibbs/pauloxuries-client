const BasicInfo = (props: { title: string; value: string }) => {
  return (
    <li className="flex-grow min-w-[45%]">
      <div className="title">
        <b>{props.title}</b>
      </div>
      <span>{props.value}</span>
    </li>
  );
};

export default BasicInfo;
