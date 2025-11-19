import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CloudLightning,
  Gauge,
  Layers,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

const features = [
  {
    title: 'Quản lý đa kênh',
    description: 'Tập trung đơn hàng từ cửa hàng, website, sàn thương mại điện tử vào một nơi duy nhất.',
    icon: Layers,
  },
  {
    title: 'Tự động hóa thông minh',
    description: 'Tự động đồng bộ tồn kho, giá bán và thông báo khách hàng trong thời gian thực.',
    icon: CloudLightning,
  },
  {
    title: 'Báo cáo realtime',
    description: 'Bảng điều khiển trực quan với hơn 30 loại báo cáo theo thời gian thực, tùy biến linh hoạt.',
    icon: BarChart3,
  },
  {
    title: 'Hiệu suất tối đa',
    description: 'Tối ưu quy trình tồn kho, nhập hàng, giao vận với công cụ AI dự báo nhu cầu.',
    icon: Gauge,
  },
  {
    title: 'Bảo mật cấp doanh nghiệp',
    description: 'Chuẩn hóa phân quyền, audit log và bảo vệ dữ liệu theo tiêu chuẩn ISO 27001.',
    icon: ShieldCheck,
  },
  {
    title: 'Đồng đội hiệu quả',
    description: 'Phối hợp đa phòng ban trên cùng nền tảng, ghi chú và phê duyệt trong một thao tác.',
    icon: Users,
  },
]

const testimonials = [
  {
    quote:
      '“Chúng tôi tiết kiệm 40% thời gian nhập liệu và ra quyết định nhanh gấp đôi nhờ dashboard realtime từ Thuần Chay VN.”',
    name: 'Nguyễn Thanh Hà',
    role: 'Giám đốc vận hành, HABASA',
  },
  {
    quote:
      '“Hệ thống tự động đồng bộ hàng hóa trên tất cả kênh giúp doanh số online của chúng tôi tăng 62% chỉ sau 3 tháng.”',
    name: 'Trần Tuấn Kiệt',
    role: 'CEO, Miniso Vietnam',
  },
  {
    quote:
      '“Bộ phận kế toán và kho hàng làm việc ăn khớp hơn bao giờ hết. Tất cả quy trình đều được minh bạch và kiểm soát.”',
    name: 'Lê Ngọc Dung',
    role: 'Head of Finance, Cheer House',
  },
]

const pricingPlans = [
  {
    title: 'Starter',
    price: '399.000',
    unit: 'đ/tháng',
    description: 'Dành cho cửa hàng mới bắt đầu chuyển đổi số.',
    highlights: [
      'Quản lý sản phẩm & tồn kho',
      'Báo cáo bán hàng cơ bản',
      'Tích hợp sàn TMĐT cơ bản',
      'Hỗ trợ 24/7 qua chat',
    ],
    featured: false,
  },
  {
    title: 'Growth',
    price: '799.000',
    unit: 'đ/tháng',
    description: 'Tối ưu cho chuỗi cửa hàng và thương mại đa kênh.',
    highlights: [
      'Tự động hóa workflow',
      'Báo cáo realtime & dự báo',
      'Quản lý nhân sự & phân quyền',
      'API mở rộng & Webhook',
    ],
    featured: true,
  },
  {
    title: 'Enterprise',
    price: 'Liên hệ',
    unit: '',
    description: 'Thiết kế riêng cho doanh nghiệp quy mô lớn.',
    highlights: [
      'Triển khai và đào tạo chuyên sâu',
      'Tùy chỉnh theo quy trình nội bộ',
      'Bảo mật doanh nghiệp & SSO',
      'Đội ngũ Customer Success riêng',
    ],
    featured: false,
  },
]

const faqs = [
  {
    question: 'Thuần Chay VN hoạt động thế nào với cửa hàng online và offline?',
    answer:
      'Thuần Chay VN đồng bộ dữ liệu giữa cửa hàng vật lý, website và các sàn thương mại điện tử theo thời gian thực. Bạn có thể theo dõi doanh thu, đơn hàng, tồn kho và khách hàng từ một bảng điều khiển duy nhất.',
  },
  {
    question: 'Việc chuyển đổi dữ liệu sang Thuần Chay VN có phức tạp không?',
    answer:
      'Chúng tôi hỗ trợ import dữ liệu từ Excel, hệ thống cũ hoặc tích hợp thông qua API. Đội ngũ Customer Success sẽ đồng hành từng bước để đảm bảo dữ liệu được đồng bộ chính xác.',
  },
  {
    question: 'Chế độ bảo mật và sao lưu dữ liệu ra sao?',
    answer:
      'Dữ liệu của bạn được mã hóa, sao lưu hàng ngày và lưu trữ trên hạ tầng đạt chuẩn ISO 27001. Bạn có thể tùy chỉnh quyền truy cập chi tiết theo phòng ban và từng nhân sự.',
  },
  {
    question: 'Tôi có thể dùng thử miễn phí không?',
    answer:
      'Tất cả khách hàng mới đều có 14 ngày dùng thử miễn phí với đầy đủ tính năng. Sau thời gian này, bạn có thể chọn gói phù hợp hoặc tiếp tục làm việc với đội ngũ chúng tôi để thiết kế giải pháp riêng.',
  },
]

const StatBadge = ({ label, value }) => (
  <div className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-left shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/60">
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)

const FeatureCard = ({ feature }) => {
  const Icon = feature.icon
  return (
  <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-card-hover dark:border-slate-800/70 dark:bg-slate-900/60">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-200 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:to-sky-700/20" />
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-soft-glow">
        <Icon size={24} />
      </div>
      <h3 className="relative z-10 mt-6 text-xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-200">
        {feature.title}
      </h3>
      <p className="relative z-10 mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {feature.description}
      </p>
    </div>
  )
}

const TestimonialCard = ({ testimonial }) => (
  <div className="glass-panel h-full rounded-3xl border border-slate-200/70 p-8 shadow-lg shadow-slate-900/10 transition hover:-translate-y-1 hover:shadow-card-hover dark:border-slate-800/60">
    <p className="text-lg font-medium text-slate-800 dark:text-slate-100"> {testimonial.quote}</p>
    <div className="mt-6 text-sm font-semibold text-slate-900 dark:text-slate-100">{testimonial.name}</div>
    <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{testimonial.role}</div>
  </div>
)

const PricingCard = ({ plan }) => (
  <div
    className={`relative flex h-full flex-col rounded-3xl border p-8 transition-all duration-500 ${
      plan.featured
        ? 'border-primary-400 bg-gradient-to-br from-primary-200 via-white to-primary-100 shadow-card-hover dark:from-sky-700/20 dark:via-slate-900 dark:to-sky-800/30'
        : 'border-slate-200/80 bg-white/80 shadow-lg shadow-slate-900/5 hover:-translate-y-1 hover:shadow-card-hover dark:border-slate-800/70 dark:bg-slate-900/60'
    }`}
  >
    {plan.featured && (
      <span className="section-badge absolute right-6 top-6 text-[10px]">Đề xuất</span>
    )}
    <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{plan.title}</h3>
    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
    <div className="mt-6 flex items-end gap-1">
      <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{plan.price}</span>
      {plan.unit && <span className="text-sm text-slate-500 dark:text-slate-400">{plan.unit}</span>}
    </div>
    <ul className="mt-6 flex-1 space-y-3 text-sm">
      {plan.highlights.map((item) => (
        <li key={item} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="mt-0.5 shrink-0 text-primary-500 dark:text-primary-300" size={18} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
    <Link
      to="/login"
      className={`mt-8 flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
        plan.featured
          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-soft-glow hover:translate-y-[-2px]'
          : 'border border-slate-200/80 text-slate-700 hover:border-primary-300 hover:text-primary-600 dark:border-slate-700 dark:text-slate-100 dark:hover:border-primary-400 dark:hover:text-primary-200'
      }`}
    >
      Bắt đầu ngay
    </Link>
  </div>
)

const FAQItem = ({ faq }) => (
  <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800/70 dark:bg-slate-900/60">
    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{faq.question}</h4>
    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{faq.answer}</p>
  </div>
)

const Landing = () => {
  const { currentUser } = useAuth()
  const primaryCtaHref = currentUser ? '/dashboard' : '/login'
  const primaryCtaLabel = currentUser ? 'Truy cập hệ thống' : 'Bắt đầu dùng thử'
  const secondaryCtaLabel = currentUser ? 'Xem dashboard' : 'Xem tính năng'

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-gradient-to-br from-sky-400/30 via-sky-200/30 to-transparent blur-3xl dark:from-sky-600/30 dark:via-slate-900/50" />
      <div className="pointer-events-none absolute right-[-120px] top-[40%] -z-10 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-sky-400/30 via-transparent to-transparent blur-3xl dark:from-sky-600/30" />

      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-soft-glow">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-200">Thuần Chay VN</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">Commerce OS</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-10 text-sm font-semibold text-slate-600 dark:text-slate-200 md:flex">
          <a className="hover:text-primary-600 dark:hover:text-primary-200" href="#features">Tính năng</a>
          <a className="hover:text-primary-600 dark:hover:text-primary-200" href="#success">Khách hàng</a>
          <a className="hover:text-primary-600 dark:hover:text-primary-200" href="#pricing">Bảng giá</a>
          <a className="hover:text-primary-600 dark:hover:text-primary-200" href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          {currentUser ? (
            <Link
              to="/dashboard"
              className="hidden rounded-xl border border-slate-200/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-600 dark:border-slate-700 dark:text-slate-100 dark:hover:border-primary-400 dark:hover:text-primary-200 md:flex"
            >
              Vào bảng điều khiển
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-xl border border-slate-200/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-600 dark:border-slate-700 dark:text-slate-100 dark:hover:border-primary-400 dark:hover:text-primary-200 md:flex"
            >
              Đăng nhập
            </Link>
          )}
          <Link to={primaryCtaHref} className="btn-primary text-sm">
            {primaryCtaLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-4 lg:px-10">
        {/* Hero */}
        <section className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="space-y-6">
            <span className="section-badge inline-flex items-center gap-2">
              <Sparkles size={16} />
              Nền tảng bán lẻ thế hệ mới
            </span>
            <h1 className="section-heading text-5xl lg:text-6xl">
              Thống nhất kênh bán hàng,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400"> tăng trưởng</span> vượt bậc.
            </h1>
            <p className="section-subheading max-w-xl">
              Thuần Chay VN Commerce OS giúp bạn quản lý đa kênh, tối ưu vận hành và ra quyết định dựa trên dữ liệu realtime.
              Sẵn sàng mở rộng doanh nghiệp với những tự động hóa thông minh nhất.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to={primaryCtaHref} className="btn-primary text-base">
                {primaryCtaLabel}
              </Link>
              {currentUser ? (
                <Link to="/dashboard" className="btn-secondary text-base">
                  {secondaryCtaLabel}
                </Link>
              ) : (
                <a href="#features" className="btn-secondary text-base">
                  {secondaryCtaLabel}
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-8 sm:grid-cols-4">
              <StatBadge label="Doanh nghiệp" value="12.000+" />
              <StatBadge label="Tăng trưởng doanh số" value="63%" />
              <StatBadge label="Thời gian triển khai" value="7 ngày" />
              <StatBadge label="Tỉ lệ hài lòng" value="4.9/5" />
            </div>
          </div>
          <div className="relative">
            <div className="glass-panel relative overflow-hidden rounded-[36px] border border-slate-200/80 p-10 shadow-card-hover dark:border-slate-800/70">
              <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl dark:bg-sky-600/30" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/80 px-5 py-4 text-sm font-semibold shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
                  <div className="flex items-center gap-3">
                    <LineChart className="text-primary-500" size={22} />
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Realtime</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Doanh thu toàn hệ thống</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-300">+32%</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Selldo</p>
                    <h4 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">Chiến dịch Flash Sale</h4>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      21.430 đơn chỉ trong 48 giờ nhờ tự động push sản phẩm lên tất cả kênh.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Inventory</p>
                    <h4 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">Dự báo tồn kho</h4>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      AI đề xuất nhập hàng chính xác, giảm 37% tồn kho chậm quay vòng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mt-24 space-y-12">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <span className="section-badge">Trải nghiệm toàn diện</span>
            <h2 className="section-heading">Thay đổi cách bạn vận hành và mở rộng</h2>
            <p className="section-subheading">
              Một nền tảng duy nhất để kết nối các điểm chạm bán hàng, tối ưu vận hành và tăng trưởng doanh nghiệp.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </section>

        {/* Success section */}
        <section id="success" className="mt-24 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="space-y-6">
            <span className="section-badge">Case study</span>
            <h2 className="section-heading">Chạm tay đến những cột mốc tăng trưởng mới</h2>
            <p className="section-subheading">
              Từ start-up tới các chuỗi bán lẻ hàng đầu đã sử dụng Thuần Chay VN để vận hành mượt mà trên mọi kênh bán hàng.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">x2.4</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Doanh thu online sau 6 tháng triển khai</p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">-35%</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Chi phí vận hành nhờ tự động hóa</p>
              </div>
            </div>
            <Link
              to={currentUser ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary-300 hover:text-primary-600 dark:border-slate-700 dark:text-slate-100 dark:hover:border-primary-500 dark:hover:text-primary-200"
            >
              {currentUser ? 'Mở bảng điều khiển' : 'Khám phá bảng điều khiển demo'}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="glass-panel relative overflow-hidden rounded-[36px] border border-slate-200/70 p-6 shadow-card-hover dark:border-slate-800/60">
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.name} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mt-24 space-y-12">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <span className="section-badge">Bảng giá</span>
            <h2 className="section-heading">Chọn giải pháp phù hợp với doanh nghiệp</h2>
            <p className="section-subheading">
              Linh hoạt nâng cấp gói dịch vụ bất cứ lúc nào. Tất cả đều bao gồm hỗ trợ triển khai và đào tạo trực tuyến.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.title} plan={plan} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-24 space-y-10">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <span className="section-badge">FAQ</span>
            <h2 className="section-heading">Câu hỏi thường gặp</h2>
            <p className="section-subheading">
              Vẫn còn thắc mắc? Liên hệ đội ngũ tư vấn 24/7 của chúng tôi để được hỗ trợ ngay lập tức.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} faq={faq} />
            ))}
          </div>
        </section>
      </main>

      {/* CTA */}
      <section className="relative border-t border-slate-200/60 bg-gradient-to-r from-primary-600 via-primary-500 to-sky-500 py-16 shadow-inner dark:border-slate-800/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 text-center text-white lg:px-10">
          <span className="inline-flex items-center gap-3 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]">
            <Sparkles size={16} />
            Sẵn sàng chuyển đổi số
          </span>
          <h2 className="text-3xl font-bold lg:text-4xl">Trải nghiệm Thuần Chay VN Commerce OS ngay hôm nay</h2>
          <p className="max-w-2xl text-sm lg:text-base text-white/90">
            Đăng ký dùng thử miễn phí hoặc đặt lịch tư vấn 1-1 để nhận lộ trình chuyển đổi số cho doanh nghiệp của bạn.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to={primaryCtaHref} className="btn-primary bg-white text-primary-600 hover:text-primary-700">
              {primaryCtaLabel}
            </Link>
            <a
              href="mailto:hello@Thuần Chay VN.vn"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Đặt lịch tư vấn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/80 py-10 text-sm text-slate-500 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/60 dark:text-slate-400">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© {new Date().getFullYear()} Thuần Chay VN. Mọi quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-200">Điều khoản</a>
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-200">Chính sách bảo mật</a>
            <a href="mailto:support@Thuần Chay VN.vn" className="hover:text-primary-600 dark:hover:text-primary-200">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing


