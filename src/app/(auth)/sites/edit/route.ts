export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;

  let siteUrl = searchParams.get("site");

  if (!siteUrl) {
    return Response.error();
  }

  siteUrl = decodeURIComponent(siteUrl);

  const getTokenUrl = new URL(siteUrl);
  getTokenUrl.pathname += "/wp-json/api/v1/mo-jwt";
  getTokenUrl.pathname = getTokenUrl.pathname.replaceAll("//", "/");

  const response = await fetch(getTokenUrl.toString(), {
    body: new URLSearchParams({
      password: process.env.WP_ADMIN_PASS!,
      username: process.env.WP_ADMIN_LOGIN!,
    }),
    headers: {
      "Content-Type": "x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    return Response.error();
  }

  const { jwt_token } = (await response.json()) as GetTokenResponse;

  const redirectUrl = new URL(siteUrl);
  redirectUrl.pathname +=
    "/wp-admin/admin.php?page=elementor-app#onboarding/hello&mo_jwt_token=";
  redirectUrl.pathname += jwt_token;
  redirectUrl.pathname = getTokenUrl.pathname.replaceAll("//", "/");

  return Response.redirect(redirectUrl.toString(), 302);
}

interface GetTokenResponse {
  jwt_token: string;
  code: number;
  expires_in: number;
  iat: number;
  token_type: "Bearer";
}
