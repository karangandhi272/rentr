export const MinimalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <div className="w-full min-h-screen">
        {children}
      </div>
    );
};