function LoginDoodles() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="text-sea-teal-light pointer-events-none absolute inset-0 hidden h-full w-full opacity-70 md:block"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* circle with a radius, drawn slightly off-round on purpose */}
        <path d="M 200 88 C 235 86 264 114 262 150 C 260 186 232 213 198 212 C 163 211 138 184 138 149 C 138 115 165 90 200 88 C 206 87 212 88 217 90" />
        <path d="M 200 150 Q 228 140 256 128" />
        <circle cx="200" cy="150" r="2.5" fill="currentColor" stroke="none" />

        {/* right triangle, a-b-c */}
        <path d="M 112 400 Q 110 460 111 520" />
        <path d="M 111 520 Q 205 522 300 519" />
        <path d="M 300 519 Q 206 460 112 400" />
        <path d="M 111 498 L 133 499 L 132 520" strokeWidth="1.5" />

        {/* parabola on its axes */}
        <path d="M 150 588 Q 149 650 150 722" strokeWidth="1.5" />
        <path d="M 88 680 Q 190 679 292 680" strokeWidth="1.5" />
        <path d="M 100 602 Q 150 732 200 602" />

        {/* sine wave on its axes */}
        <path d="M 1062 128 Q 1060 180 1061 232" strokeWidth="1.5" />
        <path d="M 1040 180 Q 1145 179 1250 180" strokeWidth="1.5" />
        <path d="M 1061 180 C 1081 128 1106 128 1126 180 C 1146 232 1171 232 1191 180 C 1206 144 1221 139 1236 154" />

        {/* angle marked with theta */}
        <path d="M 1080 470 Q 1140 471 1202 469" />
        <path d="M 1080 470 Q 1130 440 1180 409" />
        <path d="M 1120 470 A 40 40 0 0 0 1114 449" strokeWidth="1.5" />

        {/* vinculum over the discriminant, and the fraction bar */}
        <path d="M 641 705 Q 700 703 757 705" strokeWidth="1.5" />
        <path d="M 556 733 Q 660 731 762 733" />

        {/* bar of the 1/n² summand */}
        <path d="M 386 760 Q 404 759 422 760" strokeWidth="1.5" />

        {/* the answer, underlined twice, the way you would in a notebook */}
        <path d="M 1074 790 Q 1120 788 1166 790" strokeWidth="1.5" />
        <path d="M 1074 796 Q 1120 795 1166 797" strokeWidth="1.5" />
      </g>

      <g fill="currentColor" className="font-hand" stroke="none" fontSize="34">
        <text x="222" y="126">
          r
        </text>
        <text x="86" y="468">
          a
        </text>
        <text x="196" y="552">
          b
        </text>
        <text x="216" y="452">
          c
        </text>
        <text x="214" y="614">
          y = x²
        </text>
        <text x="1150" y="122">
          y = sin x
        </text>
        <text x="1126" y="458" fontSize="26">
          θ
        </text>
        <text x="110" y="300" fontSize="36">
          x² + y² = r²
        </text>
        <text x="1052" y="580">
          √2 ≈ 1.414
        </text>
      </g>

      {/* summation, integral, pi and the derivative, at display size */}
      <g fill="currentColor" className="font-hand" stroke="none">
        <text x="322" y="768" fontSize="52">
          ∑
        </text>
        <text x="332" y="722" fontSize="20">
          ∞
        </text>
        <text x="316" y="788" fontSize="20">
          n = 1
        </text>
        <text x="399" y="752" fontSize="32">
          1
        </text>
        <text x="390" y="786" fontSize="32">
          n²
        </text>

        <text x="1082" y="352" fontSize="54">
          ∫
        </text>
        <text x="1112" y="338" fontSize="34">
          f(x) dx
        </text>

        <text x="1244" y="702" fontSize="64">
          π
        </text>
        <text x="1216" y="734" fontSize="28">
          3.14159…
        </text>

        <text x="1078" y="764" fontSize="32">
          f′(x)
        </text>

        <text x="510" y="742" fontSize="36">
          x =
        </text>
        <text x="562" y="726" fontSize="34">
          −b ± √b² − 4ac
        </text>
        <text x="646" y="762" fontSize="34">
          2a
        </text>
      </g>
    </svg>
  )
}

export default LoginDoodles
