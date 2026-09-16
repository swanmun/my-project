// 아직 구현하지 않은 페이지에 임시로 쓰는 컴포넌트
type Props = {
  title: string;
  feature: string;
  todos: string[];
};

export default function PagePlaceholder({ title, feature, todos }: Props) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16">
      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
        {feature}
      </span>
      <h1 className="mt-4 text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-zinc-500">준비 중인 페이지입니다.</p>
      <ul className="mt-8 space-y-2 rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600">
        {todos.map((todo) => (
          <li key={todo}>☐ {todo}</li>
        ))}
      </ul>
    </section>
  );
}
