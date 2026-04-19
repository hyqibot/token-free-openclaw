var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject10, _templateObject11, _templateObject12, _templateObject13, _templateObject14, _templateObject15;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createStyles } from 'antd-style';
import { Sun, Cloud, CloudRain } from 'lucide-react';
import { Card, Typography } from 'antd';
import dayjs from 'dayjs';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var data = [{
  location: "杭州",
  weather: "sunny",
  temperature: 20,
  date: "2025-12-17"
}, {
  location: "杭州",
  weather: "rainy",
  temperature: 18,
  date: "2025-12-18"
}, {
  location: "杭州",
  weather: "cloudy",
  temperature: 19,
  date: "2025-12-19"
}, {
  location: "杭州",
  weather: "sunny",
  temperature: 21,
  date: "2025-12-20"
}, {
  location: "杭州",
  weather: "sunny",
  temperature: 21,
  date: "2025-12-21"
}];
var useStyles = createStyles(function (_ref) {
  var token = _ref.token,
    css = _ref.css;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    width: 100%;\n    max-width: 320px;\n    border-radius: 20px;\n    background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);\n    color: white;\n    overflow: hidden;\n    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);\n    border: none;\n\n    .ant-card-body {\n      padding: 0;\n    }\n  "]))),
    header: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    display: flex;\n    justify-content: space-between;\n    align-items: flex-start;\n  "]))),
    location: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    font-size: 24px;\n    font-weight: 600;\n    margin-bottom: 4px;\n    color: white !important;\n  "]))),
    date: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n    font-size: 14px;\n    opacity: 0.8;\n    color: white !important;\n  "]))),
    mainWeather: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    padding: 24px 0 32px;\n  "]))),
    tempContainer: css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n    display: flex;\n    align-items: flex-start;\n    line-height: 1;\n  "]))),
    temperature: css(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n    font-size: 64px;\n    font-weight: 700;\n    color: white !important;\n  "]))),
    degree: css(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n    font-size: 24px;\n    font-weight: 500;\n    margin-top: 8px;\n    color: white !important;\n  "]))),
    mainIcon: css(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["\n    font-size: 48px;\n    margin-bottom: 16px;\n    filter: drop-shadow(0 4px 4px rgba(0,0,0,0.2));\n  "]))),
    condition: css(_templateObject10 || (_templateObject10 = _taggedTemplateLiteral(["\n    font-size: 16px;\n    font-weight: 500;\n    margin-top: 8px;\n    opacity: 0.9;\n    color: white !important;\n  "]))),
    forecast: css(_templateObject11 || (_templateObject11 = _taggedTemplateLiteral(["\n    background: rgba(255, 255, 255, 0.1);\n    backdrop-filter: blur(10px);\n    padding: 16px 24px;\n  "]))),
    forecastItem: css(_templateObject12 || (_templateObject12 = _taggedTemplateLiteral(["\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 12px 0;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n    \n    &:last-child {\n      border-bottom: none;\n      padding-bottom: 4px;\n    }\n\n    &:first-child {\n      padding-top: 4px;\n    }\n  "]))),
    forecastDay: css(_templateObject13 || (_templateObject13 = _taggedTemplateLiteral(["\n    font-size: 14px;\n    width: 60px;\n    color: white !important;\n  "]))),
    forecastIcon: css(_templateObject14 || (_templateObject14 = _taggedTemplateLiteral(["\n    font-size: 20px;\n    color: white;\n  "]))),
    forecastTemp: css(_templateObject15 || (_templateObject15 = _taggedTemplateLiteral(["\n    font-size: 14px;\n    font-weight: 500;\n    width: 40px;\n    text-align: right;\n    color: white !important;\n  "])))
  };
});
var WeatherIcon = function WeatherIcon(_ref2) {
  var type = _ref2.type,
    className = _ref2.className;
  switch (type) {
    case 'sunny':
      return /*#__PURE__*/_jsx(Sun, {
        className: className
      });
    case 'rainy':
      return /*#__PURE__*/_jsx(CloudRain, {
        className: className
      });
    case 'cloudy':
      return /*#__PURE__*/_jsx(Cloud, {
        className: className
      });
    default:
      return /*#__PURE__*/_jsx(Sun, {
        className: className
      });
  }
};
var getWeatherLabel = function getWeatherLabel(type) {
  switch (type) {
    case 'sunny':
      return '晴朗';
    case 'rainy':
      return '雨天';
    case 'cloudy':
      return '多云';
    default:
      return type;
  }
};
export default function Weather() {
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var current = data[0];
  var forecast = data.slice(1);
  return /*#__PURE__*/_jsxs(Card, {
    className: styles.container,
    bordered: false,
    children: [/*#__PURE__*/_jsx("div", {
      className: styles.header,
      children: /*#__PURE__*/_jsxs("div", {
        children: [/*#__PURE__*/_jsx(Typography.Text, {
          className: styles.location,
          children: current.location
        }), /*#__PURE__*/_jsx("br", {}), /*#__PURE__*/_jsx(Typography.Text, {
          className: styles.date,
          children: dayjs(current.date).format('MM月DD日 dddd')
        })]
      })
    }), /*#__PURE__*/_jsxs("div", {
      className: styles.mainWeather,
      children: [/*#__PURE__*/_jsx(WeatherIcon, {
        type: current.weather,
        className: styles.mainIcon
      }), /*#__PURE__*/_jsxs("div", {
        className: styles.tempContainer,
        children: [/*#__PURE__*/_jsx(Typography.Text, {
          className: styles.temperature,
          children: current.temperature
        }), /*#__PURE__*/_jsx(Typography.Text, {
          className: styles.degree,
          children: "\xB0C"
        })]
      }), /*#__PURE__*/_jsx(Typography.Text, {
        className: styles.condition,
        children: getWeatherLabel(current.weather)
      })]
    }), /*#__PURE__*/_jsx("div", {
      className: styles.forecast,
      children: forecast.map(function (item, index) {
        return /*#__PURE__*/_jsxs("div", {
          className: styles.forecastItem,
          children: [/*#__PURE__*/_jsx(Typography.Text, {
            className: styles.forecastDay,
            children: dayjs(item.date).format('ddd')
          }), /*#__PURE__*/_jsx(WeatherIcon, {
            type: item.weather,
            className: styles.forecastIcon
          }), /*#__PURE__*/_jsxs(Typography.Text, {
            className: styles.forecastTemp,
            children: [item.temperature, "\xB0"]
          })]
        }, index);
      })
    })]
  });
}