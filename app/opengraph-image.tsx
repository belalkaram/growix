import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'GROWIX | منصة التسويق الإلكتروني الشاملة وحزمة الـ 12 أداة';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#0B1220',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          direction: 'rtl',
        }}
      >
        {/* Top Header Badge & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0F9D58 0%, #2ECC8F 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '28px',
                fontWeight: '900',
              }}
            >
              G
            </div>
            <span style={{ fontSize: '38px', fontWeight: '900', color: '#ffffff', letterSpacing: '2px' }}>
              GROWIX
            </span>
          </div>

          <div
            style={{
              backgroundColor: '#0F9D58',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '999px',
              fontSize: '20px',
              fontWeight: '800',
            }}
          >
            خصم 75% لفترة محدودة 🔥
          </div>
        </div>

        {/* Main Center Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1
            style={{
              fontSize: '52px',
              fontWeight: '900',
              color: '#ffffff',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            اتعلّم التسويق الإلكتروني... <br />
            <span style={{ color: '#2ECC8F' }}>وامتلك 12 أداة تسويق ذكية</span> في مكان واحد
          </h1>
          <p style={{ fontSize: '24px', color: '#9CA3AF', margin: 0, maxWidth: '900px' }}>
            كورس كامل عملي من الصفر للاحتراف + برامج أتمتة واتساب وفيس بوك وتليجرام + داتا مصر التسويقية
          </p>
        </div>

        {/* Bottom Banner Details */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '2px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '30px',
          }}
        >
          <span style={{ fontSize: '22px', color: '#2ECC8F', fontWeight: '700' }}>
            ✓ تفعيل فوري في أقل من 60 دقيقة
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px', color: '#9CA3AF', textDecoration: 'line-through' }}>
              1,000 ج
            </span>
            <span style={{ fontSize: '36px', color: '#FBBF24', fontWeight: '900' }}>
              500 ج فقط
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
