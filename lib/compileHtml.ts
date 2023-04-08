export default function compileHtml(
  name: string,
  email: string,
  phone: string,
  message: string
) {
  return `<div>
        <p>
          My name is <b style="text-transform:capitalize;font-size: 1.2em">${name}</b>,
           you can reach me through my email => <b>${email}</b> or call me on ${phone}.
        </p>
        <div>
        <h3> The Message </h3>
          <p>
            ${message}
          </p>
        </div>
        <div style="padding: 2em; background-color: #fff">
          <h3> Frutiv Tech Hub </h3>
          <p>Email to frutiv tech hub</p>
        </div>
      </div>
      `;
}
