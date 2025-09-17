import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiAnnotation, HiDocumentText, HiOutlineUserGroup } from 'react-icons/hi';
import { Alert, Spinner, Table } from 'flowbite-react';
import StatCard from './StatCard'; // Import new component
import RecentDataTable from './RecentDataTable'; // Import new component

export default function DashboardComp() {
  const { currentUser } = useSelector((state) => state.user);
  const [dashboardData, setDashboardData] = useState({
    users: [],
    comments: [],
    posts: [],
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    lastMonthUsers: 0,
    lastMonthPosts: 0,
    lastMonthComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all data concurrently for better performance
        const [userRes, postRes, commentRes] = await Promise.all([
          fetch('/api/user/getusers?limit=5'),
          fetch('/api/post/getposts?limit=5'),
          fetch('/api/comment/getcomments?limit=5'),
        ]);

        const userData = await userRes.json();
        const postData = await postRes.json();
        const commentData = await commentRes.json();

        if (userRes.ok && postRes.ok && commentRes.ok) {
          setDashboardData({
            users: userData.users,
            totalUsers: userData.totalUsers,
            lastMonthUsers: userData.lastMonthUsers,
            posts: postData.posts,
            totalPosts: postData.totalPosts,
            lastMonthPosts: postData.lastMonthPosts,
            comments: commentData.comments,
            totalComments: commentData.totalComments,
            lastMonthComments: commentData.lastMonthComments,
          });
        } else {
          // Handle potential errors from the API responses
          setError('Failed to fetch some data. Please try again.');
          console.error('API Error:', { userData, postData, commentData });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser.isAdmin) {
      fetchData();
    }
  }, [currentUser]);

  if (loading) {
    return (
        <div className='flex justify-center items-center min-h-screen'>
          <Spinner size='xl' />
        </div>
    );
  }

  if (error) {
    return (
        <div className='p-3 md:mx-auto'>
          <Alert color='failure'>Error: {error}</Alert>
        </div>
    );
  }

  return (
      <div className='p-3 md:mx-auto'>
        {/* Reusable Stat Cards */}
        <div className='flex-wrap flex gap-4 justify-center'>
          <StatCard
              title='Total Users'
              count={dashboardData.totalUsers}
              lastMonthCount={dashboardData.lastMonthUsers}
              icon={HiOutlineUserGroup}
              iconBgColor='bg-teal-600'
          />
          <StatCard
              title='Total Comments'
              count={dashboardData.totalComments}
              lastMonthCount={dashboardData.lastMonthComments}
              icon={HiAnnotation}
              iconBgColor='bg-indigo-600'
          />
          <StatCard
              title='Total Posts'
              count={dashboardData.totalPosts}
              lastMonthCount={dashboardData.lastMonthPosts}
              icon={HiDocumentText}
              iconBgColor='bg-lime-600'
          />
        </div>

        {/* Reusable Data Tables */}
        <div className='flex flex-wrap gap-4 py-3 mx-auto justify-center'>
          <RecentDataTable
              title='Recent users'
              linkTo='/dashboard?tab=users'
              headers={['User image', 'Username']}
              data={dashboardData.users}
              renderRow={(user) => (
                  <Table.Body key={user._id} className='divide-y'>
                    <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                      <Table.Cell><img src={user.profilePicture} alt={user.username} className='w-10 h-10 rounded-full bg-gray-500 object-cover'/></Table.Cell>
                      <Table.Cell>{user.username}</Table.Cell>
                    </Table.Row>
                  </Table.Body>
              )}
          />
          <RecentDataTable
              title='Recent comments'
              linkTo='/dashboard?tab=comments'
              headers={['Comment content', 'Likes']}
              data={dashboardData.comments}
              renderRow={(comment) => (
                  <Table.Body key={comment._id} className='divide-y'>
                    <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                      <Table.Cell className='w-96'><p className='line-clamp-2'>{comment.content}</p></Table.Cell>
                      <Table.Cell>{comment.numberOfLikes}</Table.Cell>
                    </Table.Row>
                  </Table.Body>
              )}
          />
          <RecentDataTable
              title='Recent posts'
              linkTo='/dashboard?tab=posts'
              headers={['Post image', 'Post Title', 'Category']}
              data={dashboardData.posts}
              renderRow={(post) => (
                  <Table.Body key={post._id} className='divide-y'>
                    <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                      <Table.Cell><img src={post.image} alt={post.title} className='w-14 h-10 rounded-md bg-gray-500 object-cover'/></Table.Cell>
                      <Table.Cell className='w-96'>{post.title}</Table.Cell>
                      <Table.Cell className='w-5'>{post.category}</Table.Cell>
                    </Table.Row>
                  </Table.Body>
              )}
          />
        </div>
      </div>
  );
}