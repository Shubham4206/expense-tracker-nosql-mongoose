
const User = require('../model/user');
const ForgotPassword = require('../model/forgot-password');
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();
const uuid = require('uuid');
const bcrypt = require('bcrypt');

exports.forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email });

        if (user) {
            const id = uuid.v4();
            await ForgotPassword.create({ id: id, active: true, userId: user._id });

            const defaultClient = SibApiV3Sdk.ApiClient.instance;
            const apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.SIB_API_KEY;

            const receivers = [
                {
                    email: email
                }
            ];
            const sender = {
                email: 'ishubham803213@gmail.com',
                name: 'Sharpener'
            };
            const emailContent = `<a href="http://localhost:4000/password/resetpassword/${id}">Reset password</a>`;

            const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

            tranEmailApi
                .sendTransacEmail({
                    sender,
                    to: receivers,
                    subject: 'Please reset your password via this link',
                    htmlContent: emailContent
                })
                .then((result) => {
                    console.log(result);
                    return res.status(200).json({ success: true, message: 'Reset password link has been sent to your email' });
                })
                .catch((error) => {
                    console.log('err1>>>>>>>>>>>>>>>>>>>>>', error);
                });
        } else {
            throw new Error('User does not exist');
        }
    } catch (error) {
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<', error);
        res.status(500).json({ message: error, success: false });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const forgotPasswordRequest = await ForgotPassword.findOne({ id: id });

        if (forgotPasswordRequest) {
            if (forgotPasswordRequest.active === true) {
                await forgotPasswordRequest.updateOne({ active: false });
                const resetForm = `
                    <html>
                        <style>
                            #resetform {
                                position: absolute;
                                left: 30%;
                                top: 30%;
                                background-color: rgb(197, 243, 197);
                                width: 60vh;
                                height: 50vh;
                            }
                            body {
                                background-color: rgb(220, 247, 220);
                            }
                        </style>
                        <body>
                            <form id="resetform" action="http://localhost:4000/password/updatepassword/${id}" method="get">
                                <label for="newpassword">Enter New password</label>
                                <input name="newpassword" type="password" required></input>
                                <button>reset password</button>
                            </form>
                        </body>
                    </html>`;
                res.status(200).send(resetForm);
                res.end();
            } else {
                throw new Error('Request has expired');
            }
        } else {
            throw new Error('Request not found');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const newPassword = req.query.newpassword;
        const resetPasswordId = req.params.id;

        const forgotPasswordRequest = await ForgotPassword.findOne({ id: resetPasswordId });
        const user = await User.findById(forgotPasswordRequest.userId);

        if (user) {
            // Encrypt the password
            const saltRounds = 10;
            const hash = await bcrypt.hash(newPassword, saltRounds);

            await user.updateOne({ password: hash });
            res.status(201).json({ message: 'Successfully updated the new password' });
        } else {
            return res.status(404).json({ error: 'No user exists', success: false });
        }
    } catch (error) {
        return res.status(403).json({ error, success: false });
    }
};
