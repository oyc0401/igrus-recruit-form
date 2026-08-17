import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Building2,
  ChevronDown,
  Check,
  Loader2,
  Wallet,
  Copy,
  CircleCheck,
  ShieldCheck,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { Button, Input, cn } from "./ui";
import {
  majorOptions,
  domainOptions,
  ENROLLMENT_STATUS_TITLE,
  enrollmentStatusOptions,
} from "./constants";

const GAS_URL = import.meta.env.VITE_GAS_URL as string | undefined;
const SLACK_INVITE_URL = import.meta.env.VITE_SLACK_INVITE_URL as
  | string
  | undefined;

const formatPhoneNumber = (digits: string) => {
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

// --- Zod Schema ---

const signupSchema = z.object({
  studentId: z
    .string()
    .min(1, "학번을 입력해주세요.")
    .regex(/^\d{8}$/, "학번은 8자리 숫자여야 합니다."),
  name: z
    .string()
    .min(1, "이름을 입력해주세요.")
    .max(50, "이름은 50자 이내여야 합니다."),
  gender: z
    .enum(["MALE", "FEMALE"], { message: "성별을 선택해주세요." })
    .optional()
    .refine((v) => v !== undefined, { message: "성별을 선택해주세요." }),
  grade: z
    .number({ message: "학년을 선택해주세요." })
    .min(1, "학년을 선택해주세요.")
    .max(4, "학년은 1~4 사이여야 합니다.")
    .optional()
    .refine((v) => v !== undefined, { message: "학년을 선택해주세요." }),
  enrollmentStatus: z.string().min(1, "재학/휴학 여부를 선택해주세요."),
  emailLocal: z.string().min(1, "이메일을 입력해주세요."),
  emailDomain: z.string().min(1, "도메인을 선택해주세요."),
  customDomain: z.string().optional(),
  phoneNumber: z
    .string()
    .min(1, "전화번호를 입력해주세요.")
    .regex(/^\d{3}-\d{4}-\d{4}$/, "올바른 전화번호를 입력해주세요."),
  department: z.string().min(1, "학과를 선택해주세요."),
  privacyConsent: z.literal(true, {
    message: "개인정보 처리방침에 동의해주세요.",
  }),
});

type SignupFormData = z.infer<typeof signupSchema>;

// --- Component ---

export default function App() {
  const [copied, setCopied] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [signupCompleted, setSignupCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      studentId: "",
      name: "",
      gender: undefined as unknown as "MALE" | "FEMALE",
      grade: undefined as unknown as number,
      enrollmentStatus: "",
      emailLocal: "",
      emailDomain: "inha.edu",
      customDomain: "",
      phoneNumber: "",
      department: "",
      privacyConsent: undefined as unknown as true,
    },
    mode: "onTouched",
  });

  const emailDomain = watch("emailDomain");

  const handleCopyAccount = async () => {
    await navigator.clipboard.writeText("토스뱅크 1002-3803-2581");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data: SignupFormData) => {
    setServerError(undefined);
    if (!GAS_URL) {
      setServerError(
        "제출 서버(VITE_GAS_URL)가 설정되지 않았습니다. 관리자에게 문의해주세요.",
      );
      return;
    }
    const domain =
      data.emailDomain === "custom" ? data.customDomain : data.emailDomain;
    try {
      // Content-Type 미지정(text/plain) → CORS preflight 없이 Apps Script로 전송 가능
      const res = await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({
          studentId: data.studentId,
          name: data.name,
          gender: data.gender === "MALE" ? "남성" : "여성",
          department: data.department,
          grade: `${data.grade}학년`,
          enrollmentStatus: data.enrollmentStatus,
          email: `${data.emailLocal}@${domain}`,
          phoneNumber: data.phoneNumber,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSignupCompleted(true);
      window.scrollTo(0, 0);
    } catch {
      setServerError(
        "제출에 실패했습니다. 잠시 후 다시 시도해주세요. 계속 실패하면 운영진에게 문의해주세요.",
      );
    }
  };

  // --- 완료 화면 ---
  if (signupCompleted) {
    return (
      <div className="mx-auto w-full max-w-lg px-s4 py-s7">
        <div className="text-center mb-s7">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-l1 dark:bg-primary/15 flex items-center justify-center mb-s5">
            <CircleCheck size={36} className="text-primary" />
          </div>
          <h1 className="typo-h2 text-foreground">가입 신청 완료!</h1>
          <p className="typo-b2 text-muted-foreground mt-s2">
            IGRUS 가입 신청이 성공적으로 접수되었습니다.
          </p>
        </div>

        {SLACK_INVITE_URL && (
          <div className="mb-s6">
            <h2 className="typo-h4 text-foreground mb-s3">
              슬랙 채널에 참여하세요
            </h2>
            <p className="typo-b2 text-muted-foreground mb-s5">
              IGRUS의 주요 소통은 슬랙에서 이루어집니다.
              <br />
              아래 버튼을 눌러 슬랙 워크스페이스에 참여해 주세요.
            </p>
            <a
              href={SLACK_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button type="button" className="w-full h-12 text-base cursor-pointer">
                IGRUS 슬랙 참여하기
                <ExternalLink size={16} />
              </Button>
            </a>
          </div>
        )}
      </div>
    );
  }

  // --- 가입 폼 화면 ---
  return (
    <div className="mx-auto w-full max-w-lg px-s4 pt-s6 pb-s2">
      {/* 헤더 */}
      <div className="mb-s6 flex flex-col items-center text-center">
        <img src="/igruslogo.png" alt="IGRUS" className="h-14 w-14" />
        <h1 className="mt-s4 typo-h2 text-foreground">IGRUS 가입 신청</h1>
        <p className="mt-s1 typo-b2 text-muted-foreground">
          아래 정보를 입력해주세요.
        </p>
      </div>

      {serverError && (
        <div className="mb-s4 rounded-r3 bg-destructive/10 border border-destructive/20 p-s4 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-s6">
        {/* 기본 정보 */}
        <Section icon={User} title="기본 정보">
          <FormField label="학번" error={errors.studentId?.message}>
            <div className="relative">
              <User
                size={18}
                className="absolute left-s3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                {...register("studentId")}
                placeholder="12345678"
                maxLength={8}
                inputMode="numeric"
                className="h-11 rounded-r3 pl-10"
              />
            </div>
          </FormField>

          <FormField label="이름" error={errors.name?.message}>
            <div className="relative">
              <User
                size={18}
                className="absolute left-s3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                {...register("name")}
                placeholder="홍길동"
                className="h-11 rounded-r3 pl-10"
              />
            </div>
          </FormField>

          <FormField label="성별" error={errors.gender?.message}>
            <div className="grid grid-cols-2 gap-s3">
              {(["MALE", "FEMALE"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setValue("gender", g, { shouldValidate: true })}
                  className={cn(
                    "h-11 rounded-r3 border text-sm font-medium transition-all cursor-pointer",
                    watch("gender") === g
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border text-foreground hover:border-primary/50",
                  )}
                >
                  {g === "MALE" ? "남성" : "여성"}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="학과" error={errors.department?.message}>
            <div className="relative">
              <Building2
                size={18}
                className="absolute left-s3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <select
                {...register("department")}
                className={cn(
                  "w-full h-11 rounded-r3 border border-input bg-background text-foreground pl-10 pr-10 text-sm",
                  "appearance-none cursor-pointer transition-all outline-none",
                  "focus:border-ring focus:ring-ring/50 focus:ring-[3px]",
                  !watch("department") && "text-muted-foreground",
                )}
              >
                <option value="" className="bg-background text-foreground">
                  학과를 선택하세요
                </option>
                {majorOptions.map((college) => (
                  <optgroup key={college.title} label={college.title}>
                    {college.items.map((dept) => (
                      <option
                        key={dept}
                        value={dept}
                        className="bg-background text-foreground"
                      >
                        {dept}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-s3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </FormField>

          <FormField label="학년" error={errors.grade?.message}>
            <div className="grid grid-cols-4 gap-s2">
              {[1, 2, 3, 4].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setValue("grade", g, { shouldValidate: true })}
                  className={cn(
                    "h-11 rounded-r3 border text-sm font-medium transition-all cursor-pointer",
                    watch("grade") === g
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border text-foreground hover:border-primary/50",
                  )}
                >
                  {g}학년
                </button>
              ))}
            </div>
          </FormField>

          <FormField
            label={ENROLLMENT_STATUS_TITLE}
            error={errors.enrollmentStatus?.message}
          >
            <div className="grid grid-cols-3 gap-s2">
              {enrollmentStatusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setValue("enrollmentStatus", status, {
                      shouldValidate: true,
                    })
                  }
                  className={cn(
                    "h-11 rounded-r3 border text-sm font-medium transition-all cursor-pointer",
                    watch("enrollmentStatus") === status
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border text-foreground hover:border-primary/50",
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="전화번호" error={errors.phoneNumber?.message}>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-s3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                {...register("phoneNumber", {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 11);
                    setValue("phoneNumber", formatPhoneNumber(digits));
                  },
                })}
                placeholder="010-1234-5678"
                maxLength={13}
                inputMode="numeric"
                className="h-11 rounded-r3 pl-10"
              />
            </div>
          </FormField>
        </Section>

        {/* 이메일 */}
        <Section icon={Mail} title="이메일" hint="연락받을 이메일이에요">
          <FormField
            error={errors.emailLocal?.message || errors.customDomain?.message}
          >
            <div className="flex items-center gap-s2">
              <div className="relative flex-1">
                <Mail
                  size={18}
                  className="absolute left-s3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  {...register("emailLocal")}
                  placeholder="이메일"
                  autoComplete="email"
                  className="h-11 rounded-r3 pl-10"
                />
              </div>
              <span className="text-muted-foreground font-bold shrink-0">@</span>
              <div className="relative flex-1">
                <select
                  {...register("emailDomain")}
                  className={cn(
                    "w-full h-11 rounded-r3 border border-input bg-background text-foreground px-s3 text-sm",
                    "appearance-none cursor-pointer transition-all outline-none",
                    "focus:border-ring focus:ring-ring/50 focus:ring-[3px]",
                  )}
                >
                  {domainOptions.map((d) => (
                    <option
                      key={d.value}
                      value={d.value}
                      className="bg-background text-foreground"
                    >
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-s3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>
            </div>
            {emailDomain === "custom" && (
              <Input
                {...register("customDomain", {
                  validate: (value) =>
                    getValues("emailDomain") === "custom" && !value
                      ? "도메인을 입력해주세요."
                      : true,
                })}
                placeholder="직접 입력 (예: gmail.com)"
                className="h-11 rounded-r3 mt-s2"
              />
            )}
          </FormField>
        </Section>

        {/* 약관 동의 */}
        <Section icon={ShieldCheck} title="약관 동의">
          <FormField error={errors.privacyConsent?.message}>
            <label className="flex items-center gap-s3 cursor-pointer group">
              <input
                type="checkbox"
                {...register("privacyConsent")}
                className="cursor-pointer accent-primary"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                개인정보 수집 및 이용에 동의합니다 (필수)
              </span>
            </label>
          </FormField>
        </Section>

        {/* 회비 납부 안내 */}
        <div className="rounded-r4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-s4 space-y-s2">
            <div className="flex items-center gap-s2">
              <Wallet size={16} className="text-amber-600 shrink-0" />
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                회비 2만원을 납부해주세요
              </p>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              입금자명 양식: 학번 2자리+이름 (ex. 26김아그)
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center">
              입금계좌: 토스뱅크 1002-3803-2581
              <button
                type="button"
                onClick={handleCopyAccount}
                className="inline-flex items-center ml-s2 hover:text-primary transition-colors cursor-pointer"
                title="계좌번호 복사"
              >
                {copied ? (
                  <Check size={14} className="text-primary" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              입금자명 양식을 지키지 않으실 경우, 회비 납부 명단에서 누락될 수
              있습니다.
            </p>
        </div>

        {/* 하단 고정 CTA */}
        <div className="sticky bottom-0 z-10 -mx-s4 px-s4 pt-s3 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-background">
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(onSubmit)()}
            className="w-full h-12 text-base font-bold cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                제출 중...
              </>
            ) : (
              "가입 신청하기"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// --- Sub Components ---

function Section({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-s6 border-t border-border/60 first-of-type:border-t-0 first-of-type:pt-0">
      <div className="mb-s4">
        <div className="flex items-center gap-s2">
          <Icon size={16} className="text-primary" />
          <h2 className="text-sm font-bold text-foreground tracking-tight">
            {title}
          </h2>
        </div>
        {hint && <p className="mt-s1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="space-y-s4">{children}</div>
    </section>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-s2">
          {label}
        </label>
      )}
      {children}
      {error && <p className="mt-s2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
