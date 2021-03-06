import { MESSAGES } from '../../../../configs/APIConfig'

export const buildPasswordRecoveryTemplate = (lang: string, userName: string, link: string): string => {
  return `
        <!doctype HTML>
            <html>
                <head>
                    <meta name="viewport" content="width=device-width" />
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                    <title>${MESSAGES[lang].recover_your_account_password}</title>
                    <style>
                        body {
                            background-color: #f6f6f6;
                            font-family: sans-serif;
                            -webkit-font-smoothing: antialiased;
                            font-size: 14px;
                            line-height: 1.4;
                            margin: 0;
                            padding: 0;
                            -ms-text-size-adjust: 100%;
                            -webkit-text-size-adjust: 100%;
                        }

                        table {
                            border-collapse: separate;
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            width: 100%;
                        }

                        table td {
                            font-family: sans-serif;
                            font-size: 14px;
                            vertical-align: top;
                        }

                        .body {
                            background-color: #f6f6f6;
                            width: 100%;
                        }

                        .container {
                            display: block;
                            margin: 0 auto !important;
                            /* makes it centered */
                            max-width: 580px;
                            padding: 10px;
                            width: 580px;
                        }

                        .content {
                            box-sizing: border-box;
                            display: block;
                            margin: 0 auto;
                            max-width: 580px;
                            padding: 10px;
                        }

                        .main {
                            background: #ffffff;
                            border-radius: 3px;
                            width: 100%;
                        }

                        .wrapper {
                            box-sizing: border-box;
                            padding: 20px;
                        }

                        .content-block {
                            padding-bottom: 10px;
                            padding-top: 10px;
                        }

                        p,
                        ul,
                        ol {
                            font-family: sans-serif;
                            font-size: 14px;
                            font-weight: normal;
                            margin: 0;
                            margin-bottom: 15px;
                        }

                        p li,
                        ul li,
                        ol li {
                            list-style-position: inside;
                            margin-left: 5px;
                        }

                        a {
                            color: #3498db;
                            text-decoration: underline;
                        }

                        .btn {
                            box-sizing: border-box;
                            width: 100%;
                        }

                        .btn>tbody>tr>td {
                            padding-bottom: 15px;
                        }

                        .btn table {
                            width: auto;
                        }

                        .btn table td {
                            background-color: #ffffff;
                            border-radius: 5px;
                            text-align: center;
                        }

                        .btn a {
                            background-color: #ffffff;
                            border: solid 1px #3498db;
                            border-radius: 5px;
                            box-sizing: border-box;
                            color: #3498db;
                            cursor: pointer;
                            display: inline-block;
                            font-size: 14px;
                            font-weight: bold;
                            margin: 0;
                            padding: 12px 25px;
                            text-decoration: none;
                            text-transform: capitalize;
                        }

                        .btn-purple table td {
                            background-color: #30a7d7;
                        }

                        .btn-purple a {
                            background-color: #30a7d7;
                            border-color: #30a7d7;
                            color: #ffffff;
                        }

                        .preheader {
                            color: transparent;
                            display: none;
                            height: 0;
                            max-height: 0;
                            max-width: 0;
                            opacity: 0;
                            overflow: hidden;
                            mso-hide: all;
                            visibility: hidden;
                            width: 0;
                        }

                        hr {
                            border: 0;
                            border-bottom: 1px solid #f6f6f6;
                            margin: 20px 0;
                        }

                        @media only screen and (max-width: 620px) {
                            table[class=body] h1 {
                                font-size: 28px !important;
                                margin-bottom: 10px !important;
                            }

                            table[class=body] p,
                            table[class=body] ul,
                            table[class=body] ol,
                            table[class=body] td,
                            table[class=body] span,
                            table[class=body] a {
                                font-size: 16px !important;
                            }

                            table[class=body] .wrapper,
                            table[class=body] .article {
                                padding: 10px !important;
                            }

                            table[class=body] .content {
                                padding: 0 !important;
                            }

                            table[class=body] .container {
                                padding: 0 !important;
                                width: 100% !important;
                            }

                            table[class=body] .main {
                                border-left-width: 0 !important;
                                border-radius: 0 !important;
                                border-right-width: 0 !important;
                            }

                            table[class=body] .btn table {
                                width: 100% !important;
                            }

                            table[class=body] .btn a {
                                width: 100% !important;
                            }
                        }

                        @media all {
                            .btn-purple table td:hover {
                                background-color: #6c757d !important;
                            }

                            .btn-purple a:hover {
                                background-color: #6c757d !important;
                                border-color: #6c757d !important;
                            }
                        }
                    </style>
                </head>

                <body class="">
                    <span class="preheader">${MESSAGES[lang].password_recovery}</span>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
                        <tr>
                            <td>&nbsp;</td>
                            <td class="container">
                                <div class="content">
                                    <table role="presentation" class="main">
                                        <tr>
                                            <td class="wrapper">
                                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td>
                                                            <p>${MESSAGES[lang].hello} ${userName}</p>
                                                            <p>
                                                                ${MESSAGES[lang].you_have_asked_for_a_password_recovery}
                                                            </p>
                                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0"
                                                                class="btn btn-purple">
                                                                <tbody>
                                                                    <tr>
                                                                        <td align="left">
                                                                            <table role="presentation" border="0" cellpadding="0"
                                                                                cellspacing="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <a href="${link}" target="_blank">${MESSAGES[lang].change_password}</a>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            <p>
                                                                ${MESSAGES[lang].in_case_the_button_does_not_work_copy_and_paste_the_link}
                                                            </p>
                                                            <p>${link}</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                            <td>&nbsp;</td>
                        </tr>
                    </table>
                </body>
            </html>
        `
}
