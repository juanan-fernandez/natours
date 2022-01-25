const nodemailer = require('nodemailer');

const sendEmail = async options => {
	//1. Crear y configurar transporter
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	//2. definir opciones del mail.
	const mailOptions = {
		from: 'Natours <natours@natours.com>',
		to: options.to,
		subject: options.subject,
		text: options.text,
		html: options.htmlMessage, //This is optional
		//attachments: attachments, //This is optional
	};

	try {
		const result = await transporter.sendMail(mailOptions);
		return result;
	} catch (err) {
		console.log(err);
	}
};

module.exports = sendEmail;

//Optional Attachments: los adjuntos deben venir como sigue.
// const attachments = [
//    {
//       filename: 'AssignmentA3.pdf',
//       path: __dirname + '/static/attachments/AssignmentA3.pdf',
//    },
// ];

//Nodemailer Options.
// var mailOptions = {
// 	from: 'pradyumnaraje.patil@gmail.com',
// 	to: 'shirishpatil1971@gmail.com',
// 	subject: 'Enter your Subject',
// 	text: 'Enter the detail here',
// 	html: '<b>This contains the html<b>', //This is optional
// 	attachments: attachments, //This is optional
// };

//resultado del envio
// {
//    accepted: [ 'juanan@gmail.com' ],
//    rejected: [],
//    envelopeTime: 319,
//    messageTime: 255,
//    messageSize: 845,
//    response: '250 2.0.0 Ok: queued',
//    envelope: { from: 'natours@natours.com', to: [ 'juanan@gmail.com' ] },
//    messageId: '<52257bc9-4d7b-2159-3b03-a0f864704efb@natours.com>'
//  }
