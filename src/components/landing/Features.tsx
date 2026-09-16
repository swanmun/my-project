// 소개 사이트의 주요 기능 섹션. 주제가 정해지면 문구를 바꾸세요.
const features = [
  { title: "간편 로그인", description: "기능 설명을 적어주세요" },
  { title: "핵심 기능", description: "기능 설명을 적어주세요" },
  { title: "지도로 찾기", description: "기능 설명을 적어주세요" },
  { title: "안전한 결제", description: "기능 설명을 적어주세요" },
];

export default function Features() {
  return (
    <section className="bg-zinc-50">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-zinc-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
