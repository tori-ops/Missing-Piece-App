'use client';

import React, { useState, useEffect } from 'react';
import styles from './WeatherGoldenHour.module.css';

interface WeatherDay {
  date: string;
  tempHigh: number;
  tempLow: number;
  precipitation: number;
  conditions: string;
}

interface WeatherWeek {
  week: number;
  startDate: string;
  endDate: string;
  days: WeatherDay[];
}

interface GoldenHourData {
  sunriseTime: string;
  goldenHourStart: string;
  goldenHourEnd: string;
  solarNoon: string;
  sunsetTime: string;
  bestPhotoDirection: string;
  bestPhotoTimeWindow: string;
  photoRecommendations: string;
}

interface AstrologyData {
  moonPhase: string;
  moonIllumination: number;
  nextFullMoon: string | null;
  nextNewMoon: string | null;
  zodiacSign: string;
  zodiacDates: string;
  venusRetrograde: boolean;
  mercuryRetrograde: boolean;
  lunarNodeSign: string;
  southNodeSign: string;
  astrologyInsights: string;
}

interface WeatherGoldenHourProps {
  clientId: string;
}

export default function WeatherGoldenHour({ clientId }: WeatherGoldenHourProps) {
  const [weatherData, setWeatherData] = useState<WeatherWeek[] | null>(null);
  const [goldenHourData, setGoldenHourData] = useState<GoldenHourData | null>(null);
  const [astrologyData, setAstrologyData] = useState<AstrologyData | null>(null);
  const [showAstrology, setShowAstrology] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [togglingAstrology, setTogglingAstrology] = useState(false);

  useEffect(() => {
    fetchWeatherData();
  }, [clientId]);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/client/weather', {
        headers: {
          'x-client-id': clientId,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Data not generated yet, try to generate it
          await generateWeatherData();
          return;
        }
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeatherData(JSON.parse(data.weather.weatherData));
      setGoldenHourData(data.goldenHour);
      setAstrologyData(data.astrology);
      setShowAstrology(data.showAstrology);
      setEventDate(data.eventDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const generateWeatherData = async () => {
    try {
      const response = await fetch('/api/client/weather', {
        method: 'POST',
        headers: {
          'x-client-id': clientId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate weather data');
      }

      const data = await response.json();
      setWeatherData(JSON.parse(data.weather.weatherData));
      setGoldenHourData(data.goldenHour);
      setAstrologyData(data.astrology);
      setEventDate(data.weather.eventDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const handleAstrologyToggle = async () => {
    setTogglingAstrology(true);
    try {
      const response = await fetch('/api/client/weather', {
        method: 'PATCH',
        headers: {
          'x-client-id': clientId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showAstrology: !showAstrology }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }

      const data = await response.json();
      setShowAstrology(data.showAstrology);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setTogglingAstrology(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading weather and golden hour data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={fetchWeatherData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData || !goldenHourData) {
    return (
      <div className={styles.container}>
        <div className={styles.noData}>
          <p>No weather data available</p>
          <button onClick={() => generateWeatherData()} className={styles.generateButton}>
            Generate Weather Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Your Big Day: Weather & Photography Guide</h1>
        {eventDate && (
          <p className={styles.eventDate}>
            Event Date: {new Date(eventDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Astrology Toggle */}
      {astrologyData && (
        <div className={styles.astrologyToggle}>
          <button
            onClick={handleAstrologyToggle}
            disabled={togglingAstrology}
            className={`${styles.toggleButton} ${showAstrology ? styles.toggleActive : ''}`}
          >
            <span className={styles.toggleIcon}>✨</span>
            {showAstrology ? 'Hide Astrology' : 'Show Astrology'}
          </button>
        </div>
      )}

      {/* Astrology Section */}
      {astrologyData && showAstrology && (
        <section className={styles.astrologySection}>
          <h2>✨ Cosmic Energy for Your Special Day</h2>

          <div className={styles.astrologyGrid}>
            <div className={styles.astrologyCard}>
              <h3>🌙 Moon Phase</h3>
              <p className={styles.astrologyValue}>{astrologyData.moonPhase}</p>
              <p className={styles.astrologyDetail}>
                Illumination: {astrologyData.moonIllumination}%
              </p>
            </div>

            <div className={styles.astrologyCard}>
              <h3>♈ Zodiac Sign</h3>
              <p className={styles.astrologyValue}>{astrologyData.zodiacSign}</p>
              <p className={styles.astrologyDetail}>{astrologyData.zodiacDates}</p>
            </div>

            <div className={styles.astrologyCard}>
              <h3>♀️ Venus Status</h3>
              <p
                className={`${styles.astrologyValue} ${
                  astrologyData.venusRetrograde ? styles.retrogradeWarning : styles.normal
                }`}
              >
                {astrologyData.venusRetrograde ? 'Retrograde ⚠️' : 'Direct 💚'}
              </p>
              <p className={styles.astrologyDetail}>Matters of the heart</p>
            </div>

            <div className={styles.astrologyCard}>
              <h3>☿️ Mercury Status</h3>
              <p
                className={`${styles.astrologyValue} ${
                  astrologyData.mercuryRetrograde ? styles.retrogradeWarning : styles.normal
                }`}
              >
                {astrologyData.mercuryRetrograde ? 'Retrograde ⚠️' : 'Direct 🗣️'}
              </p>
              <p className={styles.astrologyDetail}>Communication & travel</p>
            </div>

            <div className={styles.astrologyCard}>
              <h3>🧭 Lunar Nodes</h3>
              <p className={styles.astrologyValue}>
                {astrologyData.lunarNodeSign} / {astrologyData.southNodeSign}
              </p>
              <p className={styles.astrologyDetail}>North / South</p>
            </div>

            {astrologyData.nextFullMoon && (
              <div className={styles.astrologyCard}>
                <h3>🌕 Next Full Moon</h3>
                <p className={styles.astrologyValue}>
                  {new Date(astrologyData.nextFullMoon).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {astrologyData.nextNewMoon && (
              <div className={styles.astrologyCard}>
                <h3>🌑 Next New Moon</h3>
                <p className={styles.astrologyValue}>
                  {new Date(astrologyData.nextNewMoon).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          <div className={styles.astrologyInsights}>
            <h3>🌟 Your Astrological Journey</h3>
            <p>{astrologyData.astrologyInsights}</p>
          </div>
        </section>
      )}

      {/* Golden Hour Section */}
      <section className={styles.goldenHourSection}>
        <h2>🌅 Golden Hour Photography Guide</h2>
        <div className={styles.goldenHourGrid}>
          <div className={styles.goldenHourCard}>
            <h3>🌅 Sunrise</h3>
            <p className={styles.time}>{goldenHourData.sunriseTime}</p>
          </div>
          <div className={styles.goldenHourCard}>
            <h3>✨ Golden Hour Start</h3>
            <p className={styles.time}>{goldenHourData.goldenHourStart}</p>
          </div>
          <div className={styles.goldenHourCard}>
            <h3>✨ Golden Hour End</h3>
            <p className={styles.time}>{goldenHourData.goldenHourEnd}</p>
          </div>
          <div className={styles.goldenHourCard}>
            <h3>☀️ Solar Noon</h3>
            <p className={styles.time}>{goldenHourData.solarNoon}</p>
          </div>
          <div className={styles.goldenHourCard}>
            <h3>🌇 Sunset</h3>
            <p className={styles.time}>{goldenHourData.sunsetTime}</p>
          </div>
        </div>

        <div className={styles.photoTips}>
          <h3>📸 Best Photography Time</h3>
          <div className={styles.tipBox}>
            <p>
              <strong>Optimal Window:</strong> {goldenHourData.bestPhotoTimeWindow}
            </p>
            <p>
              <strong>Best Direction to Face:</strong> {goldenHourData.bestPhotoDirection}
            </p>
            <p className={styles.recommendations}>
              <strong>Tips:</strong> {goldenHourData.photoRecommendations}
            </p>
          </div>
        </div>
      </section>

      {/* Weather Section */}
      <section className={styles.weatherSection}>
        <h2>🌤️ 8-Week Weather Forecast</h2>
        <p className={styles.weatherDescription}>
          View weather patterns 4 weeks before and 4 weeks after your wedding day
        </p>

        {weatherData.map((week) => (
          <div key={week.week} className={styles.weekContainer}>
            <h3 className={styles.weekTitle}>
              Week {week.week} ({week.startDate} to {week.endDate})
            </h3>
            <div className={styles.weatherTable}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>High</th>
                    <th>Low</th>
                    <th>Condition</th>
                    <th>Precipitation</th>
                  </tr>
                </thead>
                <tbody>
                  {week.days.map((day) => (
                    <tr
                      key={day.date}
                      className={
                        day.conditions.includes('Rain')
                          ? styles.rainyDay
                          : day.conditions.includes('Clear')
                            ? styles.sunnyDay
                            : ''
                      }
                    >
                      <td className={styles.dateCell}>
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className={styles.tempCell}>{Math.round(day.tempHigh)}°</td>
                      <td className={styles.tempCell}>{Math.round(day.tempLow)}°</td>
                      <td className={styles.conditionCell}>{day.conditions}</td>
                      <td className={styles.precipCell}>{day.precipitation.toFixed(1)}mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <div className={styles.footer}>
        <p>Data last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
