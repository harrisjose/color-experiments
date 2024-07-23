export const Container = ({ children }) => {
  return (
    <div className="prose relative mx-auto my-10 flex flex-col justify-start bg-white py-12 px-8 shadow-xl shadow-slate-700/10 ring-1 ring-gray-900/5">
      {children}
    </div>
  );
};
