// lib/auth/login.ts
export interface LoginBody {
  email: string
  password: string
}


export const login = async (body: LoginBody) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

   if (!res.ok) {
    throw new Error('Đăng nhập thất bại');
  }

  const data = await res.json();

  // Lưu thông tin vào localStorage
  if (typeof window !== 'undefined') {
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token)
    }
    if (data.user && data.user.id) {
      localStorage.setItem('userId', data.user.id.toString())
    }
  }

  return data;
};

