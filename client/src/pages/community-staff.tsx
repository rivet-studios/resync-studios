import { useEffect, useState } from "react";

type StaffMember = {
  username: string;
  role: string;
  avatar: string;
};

type PageData = {
  staff: StaffMember[];
};

type Page = {
  title: string;
  content: string;
  data: PageData;
};

export default function CommunityStaff() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pages/community-staff")
      .then(res => res.json())
      .then((data: Page) => {
        setPage(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  if (!page) {
    return <div className="page">Failed to load page.</div>;
  }

  return (

))}
      </div>

      <style>{`
        .page {
          padding: 40px;
          color: white;
          background: #0a0a0a;
          min-height: 100vh;
        }

        .title {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .description {
          color: #aaa;
          margin-bottom: 30px;
        }

        .staff-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .staff-card {
          background: #111;
          border: 1px solid #222;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          transition: 0.2s;
        }

        .staff-card:hover {
          transform: translateY(-5px);
          border-color: #444;
        }

        .staff-card img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-bottom: 10px;
        }

        .role {
          color: #888;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}