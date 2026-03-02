import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
    buildHealthFallbackPayload,
    buildHealthPayload,
    type HealthState,
} from '@/lib/health';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
    title: 'Service Status',
    description: 'Status layanan HMTI secara realtime.',
};

const STATE_COPY: Record<HealthState, { label: string; cls: string }> = {
    operational: { label: 'Operational', cls: 'stateOperational' },
    degraded: { label: 'Degraded', cls: 'stateDegraded' },
    down: { label: 'Major Outage', cls: 'stateDown' },
};

function formatDate(dateIso: string) {
    const formatter = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium',
    });

    return formatter.format(new Date(dateIso));
}

function formatUptime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}j ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}d`;
    return `${secs}d`;
}

export default async function HealthPage() {
    const health = await buildHealthPayload().catch(() =>
        buildHealthFallbackPayload('Status page failed to collect health checks.'),
    );
    const overall = STATE_COPY[health.overallState];
    const operationalCount = health.checks.filter(
        (item) => item.state === 'operational',
    ).length;
    const averageLatency = Math.round(
        health.checks
            .map((item) => item.latencyMs)
            .filter((value): value is number => typeof value === 'number')
            .reduce((acc, value, _, arr) => acc + value / arr.length, 0),
    );

    return (
        <main className={styles.page}>
            <Header hideOnFooter={false} />
            <section className={styles.shell}>
                <div className={`container ${styles.container}`}>
                    <header className={styles.hero}>
                        <p className={styles.kicker}>HMTI Service Status</p>
                        <h1 className={styles.title}>Status Layanan</h1>
                        <p className={styles.subtitle}>{health.statusText}</p>

                        <div className={`${styles.badge} ${styles[overall.cls]}`}>
                            <span className={styles.badgeDot} />
                            {overall.label}
                        </div>
                    </header>

                    <section className={styles.metrics}>
                        <article className={styles.metricCard}>
                            <h2>Komponen Aktif</h2>
                            <p>{operationalCount}/{health.checks.length}</p>
                            <small>Berjalan normal saat ini</small>
                        </article>
                        <article className={styles.metricCard}>
                            <h2>Response Rata-rata</h2>
                            <p>{Number.isFinite(averageLatency) && averageLatency > 0 ? `${averageLatency} ms` : 'n/a'}</p>
                            <small>Dari service yang melaporkan latency</small>
                        </article>
                        <article className={styles.metricCard}>
                            <h2>Terakhir Dicek</h2>
                            <p>{formatDate(health.checkedAt)}</p>
                            <small>Uptime: {formatUptime(health.uptimeSeconds)}</small>
                        </article>
                    </section>

                    <section className={styles.topGrid}>
                        <article className={styles.card}>
                            <h2>Environment</h2>
                            <dl className={styles.kv}>
                                <div>
                                    <dt>Runtime</dt>
                                    <dd>{health.environment.runtime}</dd>
                                </div>
                                <div>
                                    <dt>Region</dt>
                                    <dd>{health.environment.region ?? 'n/a'}</dd>
                                </div>
                                <div>
                                    <dt>Deployment</dt>
                                    <dd>{health.environment.deployment ?? 'n/a'}</dd>
                                </div>
                            </dl>
                        </article>

                        <article className={styles.card}>
                            <h2>Endpoint Monitoring</h2>
                            <p className={styles.infoText}>
                                Gunakan endpoint JSON berikut untuk uptime monitor:
                            </p>
                            <code className={styles.code}>/api/health</code>
                            <p className={styles.infoText}>
                                Status code: <strong>200</strong> untuk operational/degraded, <strong>503</strong> untuk outage.
                            </p>
                        </article>
                    </section>

                    <section className={styles.componentSection}>
                        <h2>Status Komponen</h2>
                        <div className={styles.componentList}>
                            {health.checks.map((check) => {
                                const state = STATE_COPY[check.state];
                                return (
                                    <article key={check.id} className={styles.componentItem}>
                                        <div className={styles.componentHead}>
                                            <h3>{check.name}</h3>
                                            <span className={`${styles.badgeMini} ${styles[state.cls]}`}>
                                                {state.label}
                                            </span>
                                        </div>
                                        <p>{check.detail}</p>
                                        {typeof check.latencyMs === 'number' ? (
                                            <small>Latency: {check.latencyMs} ms</small>
                                        ) : null}
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </section>
            <Footer />
        </main>
    );
}
