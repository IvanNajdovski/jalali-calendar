/*
* Datepicker-Jalali v0.0.0.1
* Author : Hossein Rafiee
* repo : https://github.com/h-rafiee/Datepicker-Jalali
*
* MIT LICENSE
* Copyright (c) 2017 Hossein Rafiee (h.rafiee91@gmail.com)

* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:

* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.

* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
* */
(function ($) {
  let yearDifference = 1180;
  let settings = null;
  $.fn.datepicker = function (options) {
    // This is the easiest way to have default options.
    console.log("options", options);
    settings = $.extend(
      {
        altField: "",
        altSecondaryField: "#calendarSecondarySelector",
        minDate: null,
        maxDate: null,
        maxYear: 1420,
        minYear: 1320,
        navRight: "<",
        navLeft: ">",
        today: true,
        format: "long",
        view: "day",
        pick: "day",
        date: `${new Date().getUTCFullYear()}-${new Date().getUTCMonth() + 1}-${new Date().getUTCDate()}`,
        gregorian: false,
        data: data,
        selectedMonthEvents: [],
        selectedCategories: options.data
          ? [...new Set(options.data.map((val) => val.eventCategory))]
          : data
          ? [...new Set(data.map((val) => val.eventCategory))]
          : [],
      },
      options
    );
    return renderDatePicker(this, settings.date);
  };

  function altSecondaryFieldChange(settings) {
    let options = { day: "numeric", month: "long", year: "numeric" };
    const day = new Date(ToGregorian(parseInt(settings.shYear), parseInt(settings.shMonth), parseInt(settings.shDay)));

    if (settings.altSecondaryField) {
      $(settings.altSecondaryField).text(day.toLocaleDateString("en-GB", options));
    }
  }
  function findIfEvent(_, data) {
    return data.some((event) => {
      const eventDate = new Date(event.eventDate);

      if (isNaN(eventDate.getTime())) {
        return false;
      }

      const eventMonth = eventDate.getUTCMonth() + 1;
      const eventDay = eventDate.getUTCDate();

      return parseInt(_.month) === eventMonth && parseInt(_.day) === eventDay;
    });
  }
  function findMonthEvents(_, data) {
    return data
      .filter((event) => {
        const eventDate = new Date(event.eventDate);

        if (isNaN(eventDate.getTime())) {
          return false;
        }
        const eventMonth = eventDate.getUTCMonth() + 1;

        return parseInt(_.month) === eventMonth;
      })
      .sort((a, b) => {
        const aDate = new Date(a.eventDate).getTime();
        const bDate = new Date(b.eventDate).getTime();
        return aDate < bDate ? -1 : aDate < bDate ? 1 : 0;
      });
  }

  function renderDatePicker(_, d) {
    $(_.selector).empty();
    let navigator = ["day", "month", "year", "decade"];
    let pickLvl = [];
    pickLvl["day"] = 0;
    pickLvl["month"] = 1;
    pickLvl["year"] = 2;
    let darr = d.split("-");
    let sh_date = ToShamsi(parseInt(darr[0]), parseInt(darr[1]), parseInt(darr[2]), "short");
    let sh_date_array = sh_date.split("-");
    settings.shYear = sh_date_array[0];
    settings.cshYear = sh_date_array[0];
    settings.pshYear = sh_date_array[0];
    settings.shMonth = sh_date_array[1];
    settings.cshMonth = sh_date_array[1];
    settings.pshMonth = sh_date_array[1];
    settings.shDay = sh_date_array[2];
    settings.cshDay = sh_date_array[2];
    settings.pshDay = sh_date_array[2];
    settings.startY = parseInt(sh_date_array[0]) - 4;
    settings.endY = parseInt(sh_date_array[0]) + 4;
    if (pickLvl[settings.pick] > pickLvl[settings.view]) {
      settings.view = settings.pick;
    }
    settings.navigator = navigator[pickLvl[settings.view] + 1];

    let contentNav = calNames("hf", settings.shMonth - 1);
    let contentYear = parseInt(settings.shYear) + yearDifference;
    switch (settings.navigator) {
      case "year":
        contentNav = "";
        contentYear = settings.shYear + yearDifference;
        break;
      case "decade":
        contentNav = "";
        settings.startY = parseInt(settings.shYear) - 4;
        settings.endY = parseInt(settings.shYear) + 4;
        contentYear = settings.startY + "-" + settings.endY;
        break;
    }

    $.tmplMustache(TEMPLATE.datepciker, dataTemplate).appendTo(_);
    $.tmplMustache(TEMPLATE.navigator, { navRight: settings.navRight, navLeft: settings.navLeft, content: contentNav, contentYear }).appendTo(
      $("." + dataTemplate.css.datePickerPlotArea + " ." + dataTemplate.css.navigator, _)
    );
    $.tmplMustache(TEMPLATE.months, dataTemplate).appendTo($(s.datePickerPlotArea + " " + s.monthView, _));
    doView(_, settings.view);
    initEvents(_);
    altSecondaryFieldChange(settings);
  }
  function contentNavigator(_) {
    switch (settings.navigator) {
      case "month":
        $(s.datePickerPlotArea + " " + s.navigator + " .nav-content", _).html(calNames("hf", settings.shMonth - 1));
        $(s.datePickerPlotArea + " " + s.navigator + " .nav-content-year", _).html(parseInt(settings.shYear) + yearDifference);
        break;
      case "year":
        $(s.datePickerPlotArea + " " + s.navigator + " .nav-content-year", _).html(parseInt(settings.shYear) + yearDifference);
        break;
      case "decade":
        settings.startY = parseInt(settings.shYear) - 4;
        settings.endY = parseInt(settings.shYear) + 4;
        $(s.datePickerPlotArea + " " + s.navigator + " .nav-content-year", _).html(
          parseInt(settings.startY) + yearDifference + "-" + (parseInt(settings.endY) + yearDifference)
        );
        s;
        break;
    }
  }
  function renderNavigator(_) {
    switch (settings.navigator) {
      case "month":
        renderDays(_);
        $(s.datePickerPlotArea + " " + s.navigator + " .nav-content", _).html(calNames("hf", settings.shMonth - 1));
        $(s.datePickerPlotArea + " " + s.navigator + " .nav-content-year", _).html(parseInt(settings.shYear) + yearDifference);
        break;
      case "year":
        renderMonth(_);
        $(s.datePickerPlotArea + " " + s.navigator + " .nav-content-year", _).html(parseInt(settings.shYear) + yearDifference);
        break;
      case "decade":
        settings.startY = parseInt(settings.shYear) - 4;
        settings.endY = parseInt(settings.shYear) + 4;
        renderYear(_);
        $(s.datePickerPlotArea + " " + s.navigator + " .nav-content-year", _).html(
          parseInt(settings.startY) + yearDifference + "-" + (parseInt(settings.endY) + yearDifference)
        );
        break;
    }
  }
  function renderEvents(events, _) {
    $(s.eventList).empty();
    events.forEach((event) => {
      if (!settings.selectedCategories.includes(event.eventCategory)) return;
      const day = new Date(event.eventDate).getUTCDate();
      $.tmplMustache(TEMPLATE.eventItem, {
        ...event,
        eventMonth: calNames("hf", settings.shMonth - 1),
        eventDay: day,
        eventJalaliDay: jalaliDays[day],
      }).appendTo($(s.eventList, _));
    });
  }
  function renderCategories(eventCategories, _) {
    eventCategories.forEach((val) => {
      $.tmplMustache(TEMPLATE.eventCategory, { text: val, checked: settings.selectedCategories.includes(val) ? "checked" : "" }).appendTo(
        $(s.eventCategories, _)
      );
    });
  }
  function renderDays(_) {
    let maxDay = daysOfMonth(settings.shYear, settings.shMonth);
    // Event actions
    // Empty side panel
    $(s.eventPanel, _).html("");
    // Render side panel
    $.tmplMustache(TEMPLATE.eventList, dataTemplate).appendTo($(s.eventPanel, _));

    // Find events and categories
    const events = findMonthEvents({ month: settings.shMonth, year: settings.shYear }, settings.data);
    // store events in settings object
    settings.selectedMonthEvents = events;
    const eventCategories = [...new Set(events.map((val) => val.eventCategory))];
    // Render categories
    renderCategories(eventCategories, _);
    // Render events
    renderEvents(events, _);
    // Calendar Actions
    // Empty Calendar
    $(s.datePickerPlotArea + " " + s.dayView, _).html("");
    // Render Template
    $.tmplMustache(TEMPLATE.monthGrid, dataTemplate).appendTo($(s.datePickerPlotArea + " " + s.dayView, _));
    let first_day = hshDayOfWeek(settings.shYear, settings.shMonth, 1);

    // Render days
    for (let i = 1; i <= first_day; i++) {
      $.tmplMustache(TEMPLATE.emptyDiv, {}).appendTo($(s.datePickerPlotArea + " " + s.dayView + " " + s.tableMonthGrid + " div[data-week='1']", _));
    }
    for (let i = 1; i <= maxDay; i++) {
      if (first_day >= 7) {
        first_day = 0;
      }
      if (checkMaxDate(settings.shYear, settings.shMonth, i) || checkMinDate(settings.shYear, settings.shMonth, i)) {
        $.tmplMustache(TEMPLATE.emptyDiv, {}).appendTo($(s.datePickerPlotArea + " " + s.dayView + " " + s.tableMonthGrid + " div[data-week='1']", _));
      } else if (settings.shYear == settings.cshYear && settings.shMonth == settings.cshMonth && settings.cshDay == i) {
        $.tmplMustache(TEMPLATE.days, {
          day: i,
          event: findIfEvent({ day: i, month: settings.shMonth, year: settings.shYear }, settings.data) ? "event" : "",
          pick: settings.pick == "day" ? "pick" : "",
          today: "today",
          select: "",
          jalaliDay: jalaliDays[i],
        }).appendTo($(s.datePickerPlotArea + " " + s.dayView + " " + s.tableMonthGrid + " div[data-week='1']", _));
      } else {
        $.tmplMustache(TEMPLATE.days, {
          day: i,
          event: findIfEvent({ day: i, month: settings.shMonth, year: settings.shYear }, settings.data) ? "event" : "",
          jalaliDay: jalaliDays[i],
          pick: settings.pick == "day" ? "pick" : "",
          today: "",
          select: settings.pshYear == settings.shYear && settings.pshMonth == settings.shMonth && parseInt(settings.pshDay) == i ? "select" : "",
        }).appendTo($(s.datePickerPlotArea + " " + s.dayView + " " + s.tableMonthGrid + " div[data-week='1']", _));
      }
      first_day++;
    }
  }
  function renderMonth(_) {
    let season = 1;
    $(s.datePickerPlotArea + " " + s.monthView, _).html("");
    $.tmplMustache(TEMPLATE.months, dataTemplate).appendTo($(s.datePickerPlotArea + " " + s.monthView, _));
    for (let i = 1; i <= 12; i++) {
      if (checkMaxDate(settings.shYear, i) || checkMinDate(settings.shYear, i, daysOfMonth(settings.shYear, i))) {
        continue;
      } else {
        $.tmplMustache(TEMPLATE.eachMonth, {
          monthNumber: i,
          pick: settings.pick == "month" ? "pick" : "",
          month: calNames("hf", i - 1),
          select: settings.pshYear == settings.shYear && parseInt(settings.pshMonth) == i ? "select" : "",
          thisMonth: settings.shYear == settings.cshYear && settings.cshMonth == i ? "this" : "",
        }).appendTo($(s.datePickerPlotArea + " " + s.monthView + " " + s.tableMonths + " div[data-season='1']", _));
      }
      if (i % 3 == 0) {
        season++;
      }
    }
  }

  function renderYear(_) {
    let row = 1;
    $(s.datePickerPlotArea + " " + s.yearView, _).html("");
    $.tmplMustache(TEMPLATE.years, dataTemplate).appendTo($(s.datePickerPlotArea + " " + s.yearView, _));
    let j = 1;
    for (let i = settings.startY; i <= settings.endY; i++) {
      if (checkMaxDate(i, 1) || checkMinDate(i, 12, daysOfMonth(i, 12))) {
        $.tmplMustache(TEMPLATE.emptyDiv, {}).appendTo($(s.datePickerPlotArea + " " + s.yearView + " " + s.tableYears + " div[data-row='1']", _));
      } else {
        $.tmplMustache(TEMPLATE.eachYear, {
          year: i,
          yearDisplay: i + yearDifference,
          pick: settings.pick == "year" ? "pick" : "",
          select: parseInt(settings.pshYear) == i ? "select" : "",
          thisYear: i == settings.cshYear ? "this" : "",
        }).appendTo($(s.datePickerPlotArea + " " + s.yearView + " " + s.tableYears + " div[data-row='1']", _));
      }
      if (j % 3 == 0) {
        row++;
      }
      j++;
    }
  }

  function doView(_, v) {
    clearViews(_);
    switch (v) {
      case "day":
        renderDays(_);
        $(s.datePickerPlotArea + " " + s.yearView, _).hide();
        $(s.datePickerPlotArea + " " + s.monthView, _).hide();
        $(s.datePickerPlotArea + " " + s.dayView, _).show();
        break;
      case "month":
        renderMonth(_);
        $(s.datePickerPlotArea + " " + s.dayView, _).hide();
        $(s.datePickerPlotArea + " " + s.yearView, _).hide();
        $(s.datePickerPlotArea + " " + s.monthView, _).show();
        break;
      case "year":
        renderYear(_);
        $(s.datePickerPlotArea + " " + s.dayView, _).hide();
        $(s.datePickerPlotArea + " " + s.monthView, _).hide();
        $(s.datePickerPlotArea + " " + s.yearView, _).show();
        break;
    }
  }

  function clearViews(_) {
    $(s.datePickerPlotArea + " " + s.dayView, _).html("");
    $(s.datePickerPlotArea + " " + s.monthView, _).html("");
    $(s.datePickerPlotArea + " " + s.yearView, _).html("");
  }

  function daysOfMonth(y, m) {
    let maxDay = 31;
    if (m > 6 && m < 12) {
      maxDay = 30;
    } else if (m == 12 && hshIsLeap(y)) {
      maxDay = 30;
    } else if (m == 12) {
      maxDay = 29;
    }
    return maxDay;
  }
  let grgSumOfDays = Array(
    Array(0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365),
    Array(0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366)
  );
  let hshSumOfDays = Array(
    Array(0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336, 365),
    Array(0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336, 366)
  );

  function ToShamsi(grgYear, grgMonth, grgDay, Format) {
    let hshYear = grgYear - 621;
    let hshMonth, hshDay;

    let grgLeap = grgIsLeap(grgYear);
    let hshLeap = hshIsLeap(hshYear - 1);

    let hshElapsed;
    let grgElapsed = grgSumOfDays[grgLeap ? 1 : 0][grgMonth - 1] + grgDay;

    let XmasToNorooz = hshLeap && grgLeap ? 80 : 79;

    if (grgElapsed <= XmasToNorooz) {
      hshElapsed = grgElapsed + 286;
      hshYear--;
      if (hshLeap && !grgLeap) hshElapsed++;
    } else {
      hshElapsed = grgElapsed - XmasToNorooz;
      hshLeap = hshIsLeap(hshYear);
    }

    for (let i = 1; i <= 12; i++) {
      if (hshSumOfDays[hshLeap ? 1 : 0][i] >= hshElapsed) {
        hshMonth = i;
        hshDay = hshElapsed - hshSumOfDays[hshLeap ? 1 : 0][i - 1];
        break;
      }
    }

    if (Format.toLowerCase() == "long")
      return hshDayName(hshDayOfWeek(hshYear, hshMonth, hshDay)) + "  " + hshDay + " " + calNames("hf", hshMonth - 1) + " " + hshYear;
    else return hshYear + "-" + hshMonth + "-" + hshDay;
  }

  function formatAltField(hshYear, hshMonth, hshDay, Format) {
    switch (settings.pick) {
      case "day":
        if (settings.gregorian == true) {
          return ToGregorian(hshYear, hshMonth, hshDay);
        }
        if (Format.toLowerCase() == "long")
          return hshDayName(hshDayOfWeek(hshYear, hshMonth, hshDay)) + "  " + hshDay + " " + calNames("hf", hshMonth - 1) + " " + hshYear;
        else return hshYear + "-" + hshMonth + "-" + hshDay;
        break;
      case "month":
        if (settings.gregorian == true) {
          return ToGregorian(hshYear, hshMonth, hshDay);
        }
        if (Format.toLowerCase() == "long") return calNames("hf", hshMonth - 1) + " " + hshYear;
        else return hshYear + "-" + hshMonth;
        break;
      case "year":
        if (settings.gregorian == true) {
          return ToGregorian(hshYear, hshMonth, hshDay);
        }
        return hshYear;
        break;
    }
  }

  function ToGregorian(hshYear, hshMonth, hshDay) {
    let grgYear = hshYear + 621;
    let grgMonth, grgDay;

    let hshLeap = hshIsLeap(hshYear);
    let grgLeap = grgIsLeap(grgYear);

    let hshElapsed = hshSumOfDays[hshLeap ? 1 : 0][hshMonth - 1] + hshDay;
    let grgElapsed;

    if (hshMonth > 10 || (hshMonth == 10 && hshElapsed > 286 + (grgLeap ? 1 : 0))) {
      grgElapsed = hshElapsed - (286 + (grgLeap ? 1 : 0));
      grgLeap = grgIsLeap(++grgYear);
    } else {
      hshLeap = hshIsLeap(hshYear - 1);
      grgElapsed = hshElapsed + 79 + (hshLeap ? 1 : 0) - (grgIsLeap(grgYear - 1) ? 1 : 0);
    }

    for (let i = 1; i <= 12; i++) {
      if (grgSumOfDays[grgLeap ? 1 : 0][i] >= grgElapsed) {
        grgMonth = i;
        grgDay = grgElapsed - grgSumOfDays[grgLeap ? 1 : 0][i - 1];
        break;
      }
    }
    if (settings.pick == "year") return grgYear;
    if (settings.pick == "month") return grgYear + "-" + zeroPad(grgMonth, 2);
    return grgYear + "-" + zeroPad(grgMonth, 2) + "-" + zeroPad(grgDay, 2);
  }

  function hshDayOfWeek(hshYear, hshMonth, hshDay) {
    let value;
    value = hshYear - 1376 + hshSumOfDays[0][hshMonth - 1] + hshDay - 1;

    for (let i = 1380; i < hshYear; i++) if (hshIsLeap(i)) value++;
    for (let i = hshYear; i < 1380; i++) if (hshIsLeap(i)) value--;

    value = value % 7;
    if (value < 0) value = value + 7;

    return value;
  }

  function grgIsLeap(Year) {
    return Year % 4 == 0 && (Year % 100 != 0 || Year % 400 == 0);
  }

  function hshIsLeap(Year) {
    Year = (Year - 474) % 128;
    Year = (Year >= 30 ? 0 : 29) + Year;
    Year = Year - Math.floor(Year / 33) - 1;
    return Year % 4 == 0;
  }

  function hshDayName(DayOfWeek) {
    return calNames("df", DayOfWeek % 7);
  }

  function calNames(calendarName, monthNo) {
    switch (calendarName) {
      case "hf":
        return Array("فروردين", "ارديبهشت", "خرداد", "تير", "مرداد", "شهريور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند")[monthNo];
      case "ge":
        return Array(
          " January ",
          " February ",
          " March ",
          " April ",
          " May ",
          " June ",
          " July ",
          " August ",
          " September ",
          " October ",
          " November ",
          " December "
        )[monthNo];
      case "gf":
        return Array("ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوثن", "ژوییه", "اوت", "سپتامبر", "اكتبر", "نوامبر", "دسامبر")[monthNo];
      case "df":
        return Array("شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه")[monthNo];
      case "de":
        return Array("Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday")[monthNo];
    }
  }

  $.tmplMustache = function (input, dict) {
    // Micro Mustache Template engine
    String.prototype.format = function string_format(arrayInput) {
      function replacer(key) {
        let keyArr = key.slice(2, -2).split("."),
          firstKey = keyArr[0],
          SecondKey = keyArr[1];
        if (arrayInput[firstKey] instanceof Object) {
          return arrayInput[firstKey][SecondKey];
        } else {
          return arrayInput[firstKey];
        }
      }

      return this.replace(/{{\s*[\w\.]+\s*}}/g, replacer);
    };
    return $(input.format(dict));
  };

  function initEvents(e) {
    let self = e;

    // Category Item Click Handler
    $(s.calendar).on("click", ".event-item", function (e) {
      const options = { day: "numeric", month: "long", year: "numeric" };

      // Get the unique identifier for each event
      const dataId = e.currentTarget.getAttribute("data-id");

      // Find the clicked event
      const event = settings.selectedMonthEvents.find((val) => val.eventName === dataId);
      const eventDate = new Date(event.eventDate);
      const year = eventDate.getUTCFullYear();
      const month = eventDate.getUTCMonth() + 1;
      const day = eventDate.getUTCDate();

      // Pass the relevant data to the modal template
      console.log({
        ...event,
        startDate: new Date(year - yearDifference, month, day).toLocaleDateString("en-US"),
        endDate: new Date(year - yearDifference, month, day + 1).toLocaleDateString("en-US"),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        eventDay: day,
        eventMonth: calNames("hf", settings.shMonth - 1),
      });
      $.tmplMustache(TEMPLATE.modal, {
        ...event,
        startDate: new Date(year - yearDifference, month, day).toLocaleDateString("en-US"),
        endDate: new Date(year - yearDifference, month, day + 1).toLocaleDateString("en-US"),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        eventDay: day,
        eventMonth: calNames("hf", settings.shMonth - 1),
      }).appendTo($(self, self));
    });

    // Modal Close Handler
    $(s.calendar).on("click", ".close", function (e) {
      $(".modal").remove();
    });

    // Category change handler
    $(s.eventPanel).on("change", ".category-checkbox-input", function (e) {
      const value = e.target.value;
      const checked = e.target.checked;
      if (checked) settings.selectedCategories.push(value);
      else settings.selectedCategories = settings.selectedCategories.filter((categoryName) => value !== categoryName);

      const filteredCategoryEvents = settings.selectedMonthEvents.filter((event) => settings.selectedCategories.includes(event.eventCategory));
      renderEvents(filteredCategoryEvents, self);
    });

    // Today Button click handler
    $(s.today, e).bind("click", function () {
      const today = new Date();
      const todayYear = today.getUTCFullYear();
      const todayMonth = today.getUTCMonth() + 1;
      const todayDate = today.getUTCDate();
      settings.date = `${todayYear}-${todayMonth}-${todayDate}`;
      settings.view = "day";
      renderDatePicker(self, settings.date);
    });
    $(s.datePickerPlotArea + " " + s.navigator + " " + ".nav-right", e).bind("click", function () {
      return navigator(self, "prev");
    });
    $(s.datePickerPlotArea + " " + s.navigator + " " + ".nav-left", e).bind("click", function () {
      navigator(self, "next");
    });
    $(s.datePickerPlotArea + " " + s.navigator + " " + ".nav-content", e).bind("click", function () {
      return navigator(self, "view");
    });
    $(s.datePickerPlotArea + " " + s.yearView, e).on("click", ".year", function () {
      settings.shYear = parseInt($(this).attr("data-val"));
      if ($(this).hasClass("pick")) {
        clearSelection();
        $(this).addClass("select");
        settings.pshYear = parseInt($(this).attr("data-val"));
        altSecondaryFieldChange(settings);
        return true;
      }
      settings.view = "month";
      settings.navigator = "year";
      doView(self, settings.view);
      contentNavigator(self);
    });
    $(s.datePickerPlotArea + " " + s.monthView, e).on("click", ".month", function () {
      settings.shMonth = parseInt($(this).attr("data-val"));
      if ($(this).hasClass("pick")) {
        clearSelection();
        settings.pshYear = settings.shYear;
        settings.pshMonth = parseInt($(this).attr("data-val"));
        $(this).addClass("select");
        altSecondaryFieldChange(settings);
        return true;
      }
      settings.view = "day";
      settings.navigator = "month";
      doView(self, settings.view);
      contentNavigator(self);
    });
    $(s.datePickerPlotArea + " " + s.dayView, e).on("click", ".day", function () {
      settings.shDay = parseInt($(this).attr("data-val"));
      settings.pshYear = settings.shYear;
      settings.pshMonth = settings.shMonth;
      settings.pshDay = parseInt($(this).attr("data-val"));
      clearSelection();
      $(this).addClass("select");
      altSecondaryFieldChange(settings);
      const hasEvent = $(this).find(".event").length !== 0;
      if (hasEvent) {
        console.log("Date has event:", hasEvent);
      }
    });
  }

  function clearSelection() {
    $(s.datePickerPlotArea + " * .select").each(function () {
      $(this).removeClass("select");
    });
  }

  function navigator(e, to) {
    switch (to) {
      case "next":
        switch (settings.navigator) {
          case "month":
            if (checkMaxDate(settings.shYear, parseInt(settings.shMonth) + 1)) {
              return false;
            }
            settings.shMonth = parseInt(settings.shMonth) + 1;
            if (settings.shMonth > 12) {
              settings.shMonth = 1;
              settings.shYear = parseInt(settings.shYear) + 1;
            }
            renderNavigator(e);
            break;
          case "year":
            if (checkMaxDate(parseInt(settings.shYear) + 1, 1)) {
              return false;
            }
            settings.shYear = parseInt(settings.shYear) + 1;
            renderNavigator(e);
            break;
          case "decade":
            if (checkMaxDate(parseInt(settings.shYear) + 9, 1)) {
              return false;
            }
            settings.shYear = parseInt(settings.shYear) + 9;
            renderNavigator(e);
            break;
        }
        break;
      case "prev":
        switch (settings.navigator) {
          case "month":
            if (checkMinDate(settings.shYear, parseInt(settings.shMonth) - 1, daysOfMonth(settings.shYear, parseInt(settings.shMonth) - 1))) {
              return false;
            }
            settings.shMonth = parseInt(settings.shMonth) - 1;
            if (settings.shMonth < 1) {
              settings.shMonth = 12;
              settings.shYear = parseInt(settings.shYear) - 1;
            }
            renderNavigator(e);
            break;
          case "year":
            if (checkMinDate(parseInt(settings.shYear) - 1, 12, daysOfMonth(parseInt(settings.shYear) - 1, 12))) {
              return false;
            }
            settings.shYear = parseInt(settings.shYear) - 1;
            renderNavigator(e);
            break;
          case "decade":
            if (checkMinDate(parseInt(settings.shYear) - 9, 12, daysOfMonth(parseInt(settings.shYear) - 9, 12))) {
              return false;
            }
            settings.shYear = parseInt(settings.shYear) - 9;
            renderNavigator(e);
            break;
        }
        break;
      case "view":
        switch (settings.navigator) {
          case "month":
            settings.navigator = "year";
            settings.view = "month";
            doView(e, settings.view);
            contentNavigator(e);
            break;
          case "year":
            settings.navigator = "decade";
            settings.view = "year";
            doView(e, settings.view);
            contentNavigator(e);
            break;
        }
        break;
    }
  }

  function zeroPad(num, places) {
    let zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  function checkMaxDate(y, m, d) {
    d = d || 1;
    if (y + "-" + zeroPad(m, 2) + "-" + zeroPad(d, 2) > settings.maxDate) return true;
    return false;
  }

  function checkMinDate(y, m, d) {
    d = d || 1;
    if (y + "-" + zeroPad(m, 2) + "-" + zeroPad(d, 2) < settings.minDate) return true;
    return false;
  }

  const jalaliDays = {
    1: "هرمزد",
    2: "بهمن",
    3: "اردیبهشت",
    4: "شهریور",
    5: "سپندارمذ",
    6: "خرداد",
    7: "امرداد",
    8: "دی به آذر",
    9: "آذر",
    10: "آبان",
    11: "خور",
    12: "ماه",
    13: "تیر",
    14: "ایزد گوش",
    15: "دی به مهر",
    16: "مهر",
    17: "سروش",
    18: "رَشن",
    19: "فروردین",
    20: "بهرام",
    21: "رام",
    22: "باد",
    23: "دی به دین",
    24: "دین",
    25: "ارد",
    26: "اشتاد",
    27: "آسمان",
    28: "زامیاد",
    29: "مهراسپند",
    30: "انارام",
    31: "اَورداد",
  };
  //selectors
  const s = {
    calendar: ".calendar",
    datePickerPlotArea: ".datepicker-jalali",
    navigator: ".datepicker-navigator",
    tableMonthGrid: ".datepicker-tablemonthgrid",
    tableMonths: ".datepicker-tablemonths",
    tableYears: ".datepicker-tableyears",
    tableYears: ".datepicker-tableyears",
    dayView: ".datepicker-days",
    monthView: ".datepicker-month",
    yearView: ".datepicker-years",
    toolbox: ".datepicker-tools",
    day: ".day",
    today: "#today",
    eventPanel: ".event-panel",
    eventList: ".event-list",
    eventCategories: ".event-categories",
    eventItem: ".event-item",
    selectedDate: ".selected-date",
  };

  const dataTemplate = {
    css: {
      datePickerPlotArea: "datepicker-jalali",
      navigator: "datepicker-navigator",
      calendarControls: "calendar-controls",
      tableMonthGrid: "datepicker-tablemonthgrid",
      tableMonths: "datepicker-tablemonths",
      tableYears: "datepicker-tableyears",
      tableYears: "datepicker-tableyears",
      dayView: "datepicker-days",
      monthView: "datepicker-month",
      yearView: "datepicker-years",
      toolbox: "datepicker-tools",
      eventPanel: "event-panel",
      eventList: "event-list",
      eventCategories: "event-categories",
      eventItem: "event-item",
      selectedDate: "selected-date",
    },
  };

  const TEMPLATE = {
    datepciker:
      "<div class='{{css.eventPanel}}' ></div>" +
      "<div class='{{css.datePickerPlotArea}}' >" + //
      "<div class='{{css.navigator}}' ></div>" + //
      "<div class='{{css.calendarControls}}' ><button id='today'>Today</button></div>" + //
      "<div class='{{css.dayView}}' ></div>" + //
      "<div class='{{css.monthView}}' ></div>" + //
      "<div class='{{css.yearView}}' ></div>" + //
      "<div class='{{css.toolbox}}' ></div>" + //
      "<div id='calendarSecondarySelector' class='{{css.selectedDate}}' ></div>" + //
      "</div>",

    navigator:
      `<div class="nav-left arrow-btn"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fit="" preserveAspectRatio="xMidYMid meet"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></div>` +
      `<div class="nav-right arrow-btn"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fit="" preserveAspectRatio="xMidYMid meet"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></div>` +
      "<span class='nav-content-year'>{{contentYear}}</span>" +
      "<span class='nav-content'>{{content}}</span>",
    years: "<div class='{{css.tableYears}}'><div data-row='1'></div></div>",
    eachYear: "<div><span class='year {{pick}} {{select}} {{thisYear}}' data-val='{{year}}'>{{yearDisplay}}</span></div>",
    months: "<div class='{{css.tableMonths}}'>" + "<div data-season='1'></div>" + "</div>",
    eachMonth: "<div><span class='month {{pick}} {{select}} {{thisMonth}}' data-val='{{monthNumber}}'>{{month}}</span></div>",
    monthGrid:
      "<div class='{{css.tableMonthGrid}}'>" +
      "<div class='datepicker-grid-day'><div>شنبه</div><div>یک‌شنبه</div><div>دوشنبه</div><div>سه‌شنبه</div><div>چهارشنبه</div><div>پنج‌شنبه</div><div>آدینه</div></div>" +
      "<div data-week='1'></div>" +
      "</div>",
    days: "<div><div class='day {{pick}} {{select}} {{today}} {{event}}' data-val='{{day}}'><div>{{day}}</div><small class='jalali-day'>{{jalaliDay}}</small></div></div>",
    emptyDiv: "<div><span>&nbsp;</span></div>",
    eventList: "<div class='{{css.eventCategories}}'></div><div class='divider'></div><ul class='{{css.eventList}}'></ul>",
    eventCategory:
      "<div class='event-category'><input class='category-checkbox-input' id='{{text}}' value='{{text}}' {{checked}} type='checkbox'><label for='{{text}}' class='category-checkbox'><small>{{text}}</small></label></div>",
    eventItem: `<li class='event-item' data-id='{{eventName}}'>
      <div class='event-date'>
      <h1>{{eventDay}}</h1>
      <span>{{eventMonth}}</span>
      </div>
      <div class='event-description'><p>{{eventCategory}}</p><h3 style="font-size:26px;">{{eventName}}</h3></div>
      </li>`,
    modal: `<div id='modal' class='modal'>
    <script type="text/javascript" src="https://cdn.addevent.com/libs/atc/1.6.1/atc.min.js" async defer></script>
      <div class='modal-content'>
      <div class='close-content'><span class='close'>&times;</span></div>
      <div class='modal-content-main'>
      <div class='modal-content-alt'><div class='modal-content-image'><img alt='image for {{eventName}}' src='{{eventImage}}'/></div></div>
      <div class='modal-content-description'>
      <div>
      <div>
      <div title="Add to Calendar" class="addeventatc">
      Add To Calendar
      <span class="start">{{startDate}}</span>
      <span class="end">{{endDate}}</span>
      <span class="timezone">{{timeZone}}</span>
      <span class="title">{{eventName}}</span>
      <span class="description">{{eventCategory}}</span>
      <span class="date_format">MM/DD/YYYY</span>
      <span class="all_day_event">true</span>
    </div>
    </div>
      <div class='event-item' data-id='{{eventName}}'>
      <div class='event-date_2'>
      <h1>{{eventDay}}</h1>
      <span>{{eventMonth}}</span>
      </div>
      <div class='event-description_2'><p>{{eventCategory}}</p><h3>{{eventName}}</h3></div>
      </div><h1 style="text-align:center;margin-top:30px;"><span class="ca">{{eventCategory}}</span><br> <span class="nm">{{eventName}}</span></h1><p>{{eventDescription}}</p></div>
      </div>
      </div>
      </div>`,
  };
})(jQuery);
