export async function apiFetch(url: string, options: RequestInit = {}) {
  try {
    let token = localStorage.getItem("token");

    let res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
      credentials: "include",
    });

    // If 401 (unauthenticated) or 403 (forbidden), try refresh
    if (res.status === 401 || res.status === 403) {
      const refreshRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("token", data.accessToken);

        // Retry original request with new token
        res = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${data.accessToken}`,
          },
          credentials: "include",
        });
      } else {
        // Refresh failed → force logout
        localStorage.clear();
        if (window.location.pathname !== "/authPages/login") {
          window.location.href = "/authPages/login";
        }
        return null;
      }
    }

    // If response is still 401 or 403 after retry, logout
    // if (res.status === 401 || res.status === 403) {
    //   localStorage.clear();
    //   if (window.location.pathname !== "/authPages/login") {
    //     window.location.href = "/authPages/login";
    //   }
    //   return null;
    // }

    return res;
  } catch (err) {
    // Any network or unexpected error → logout
    // console.error("API fetch error:", err);
    // localStorage.clear();
    // if (window.location.pathname !== "/authPages/login") {
    //   window.location.href = "/authPages/login";
    // }
    // return null;
  }
}