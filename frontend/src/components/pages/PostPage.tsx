import PostPage from "../home/PostComponents/PostPage";
import RightPanel from "../home/PostComponents/RightPanel";

const HomePage = () => {
  return (
    <main className="flex-1 h-full">
      <div className="flex h-[calc(100vh-0px)] max-w-[1700px] mx-auto bg-left-panel">
        <div className="bg-color-background text-color-foreground fixed top-0 left-0 w-full h-36 -z-30" />

        <div
          className="w-full md:w-4/6 h-full 
           flex  "
        >
          <PostPage />
        </div>

        <div
          className="w-full md:w-1/6 h-full 
           flex"
        >
          <RightPanel />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
