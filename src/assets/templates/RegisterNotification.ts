import { UserModelDto } from 'src/modelDTO/user'

export const RegisterNotification = (
  user?: UserModelDto.UserRegisterNotificationDto
) => `<div style="background-color: #e9ecef;">
<table border="0" cellpadding="0" cellspacing="0" width="100%"style="margin-top:10vh">
  <tr>
    <td align="center" bgcolor="#e9ecef">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        <tr>
          <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
            <div style="display: flex; width: 100%; justify-content: center; margin-bottom: 20px;">  
              <a href="${process.env.JWT_USER_CLIENT_HOST_APP}" target="_blank" style="display: inline-block;">
            </a>
          </div>
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Your account has been created</h1>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" bgcolor="#e9ecef">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                <p style="margin: 0;"><span style="font-weight: 700">Important note:</span> because this is a temporary password for initialization, customers need to change to another password as soon as possible to increase account security.</p>
            </td>
        </tr>
        <tr>
          <td align="left" bgcolor="#ffffff">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px;">
                <p>Username: ${user.email}</p>
                <p>Password: ${user.password}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</div>`
