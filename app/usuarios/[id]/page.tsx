// app/users/[id]/page.tsx (or wherever the [id] folder is)
import { notFound } from 'next/navigation';

// Define the type based on the provided JSON
interface Address {
  street: string;
  city: string;
  number: number;
}

interface User {
  id: number;
  name: string;
  gmail: string;
  role: string;
  address?: Address | null;
}

// Page component - params is a Promise in Next.js 15+
export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Await the params
  const { id } = await params;

  // 2. Fetch the user data from the internal API
  // Using absolute URL for fetch in server components (or relative if same origin, but absolute is safer for SSR).
  // For simplicity, we'll use the internal API route they already have.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/v1/users/${id}`, {
    cache: 'no-store', // or 'force-cache' depending on needs, default is 'force-cache' in server components, but we want fresh data maybe.
    headers: {
      // If authentication is required, add the token here.
      // Since their API checks for 'Authorization' header, we need to pass one.
      // They used 'admin-token' or 'user-token'. 
      // For the view, they might want to pass 'admin-token' to see it, or modify the API to not require auth for GET.
      // I'll mention that they need to pass the token.
      'Authorization': `Bearer admin-token`, // Hardcoded for testing, they should replace with actual token logic.
    }
  });

  // 3. Handle errors
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    // You could throw an error or render an error message
    throw new Error(`Failed to fetch user: ${res.status}`);
  }

  const user: User = await res.json();

  // 4. Render the view
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1>User Profile</h1>
      <div>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.gmail}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <div className="border-t pt-4">
          <h2 className="font-semibold text-xl mb-2">Address</h2>
          <p><strong>Street:</strong> {user.address.street}</p>
          <p><strong>Number:</strong> {user.address.number}</p>
          <p><strong>City:</strong> {user.address.city}</p>
        </div>
      </div>
    </div>
  );
}