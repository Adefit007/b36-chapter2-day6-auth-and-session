let projects = [];

function getDateDifference(startDate, endDate) {
  if (startDate > endDate) {
    console.error("Start date must be before end date");
    return null;
  }
  let startYear = startDate.getFullYear();
  let startMonth = startDate.getMonth();
  let startDay = startDate.getDate();
  let endYear = endDate.getFullYear();
  let endMonth = endDate.getMonth();
  let endDay = endDate.getDate();

  let february =
    (endYear % 4 == 0 && endYear % 100 != 0) || endYear % 400 == 0 ? 29 : 28;

  let daysOfMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let startDateNotPassedInEndYear =
    endMonth < startMonth || (endMonth == startMonth && endDay < startDay);

  let years = endYear - startYear - (startDateNotPassedInEndYear ? 1 : 0);

  let months = (12 + endMonth - startMonth - (endDay < startDay ? 1 : 0)) % 12;

  let days =
    startDay <= endDay
      ? endDay - startDay
      : daysOfMonth[(12 + endMonth - 1) % 12] - startDay + endDay;

  return { years: years, months: months, days: days };
}

function addProjects() {
  let title = document.getElementById("inputProjectName").value;
  let startDate = new Date(document.getElementById("inputStartDate").value);
  let endDate = new Date(document.getElementById("inputEndDate").value);
  let lengthDate = getDateDifference(startDate, endDate);
  let description = document.getElementById("inputDescription").value;
  let image = document.getElementById("uploadImage").files[0];

  console.log(title);
  // console.log(startDate);
  // console.log(endDate);
  console.log(lengthDate.days);
  console.log(lengthDate.months);
  console.log(description);
  console.log(image);

  let logoTechlist = [];
  // Check if checkbox technology is checked, then add to array list
  if (document.getElementById("node-js").checked) {
    logoTechlist.push("node-js");
  }
  if (document.getElementById("react-js").checked) {
    logoTechlist.push("react-js");
  }
  if (document.getElementById("next-js").checked) {
    logoTechlist.push("next-js");
  }
  if (document.getElementById("typescript-js").checked) {
    logoTechlist.push("typescript-js");
  }

  console.log(logoTechlist);

  image = URL.createObjectURL(image);

  let project = {
    title: title,
    lengthDateMonths: lengthDate.months,
    lengthDateDays: lengthDate.days,
    description: description,
    logoTechlist: logoTechlist,
    image: image,
    postedAt: new Date(),
  };

  projects.push(project);

  renderProjects();
}

function checkTechLogoifExists(list) {
  let logoTech = "";

  // Check if checkbox technology is checked, then return their logo
  if (list.includes("node-js")) {
    logoTech += '<img src="assets/nodejs-icon.svg" alt="">';
  }
  if (list.includes("react-js")) {
    logoTech += '<img src="assets/react.svg" alt="">';
  }
  if (list.includes("next-js")) {
    logoTech += '<img src="assets/nextjs.svg" alt="">';
  }
  if (list.includes("typeScript-js")) {
    logoTech += '<img src="assets/typescript.svg" alt="">';
  }
  return logoTech;
}

function getDistanceTime(time) {
  const timeNow = new Date();
  const timePost = new Date(time);

  const distance = timeNow - timePost;

  const milisecondsInDay = 1000 * 60 * 60 * 24;
  const distanceDay = Math.floor(distance / milisecondsInDay);

  if (distanceDay >= 1) {
    return `${distanceDay} day ago`;
  } else {
    const milisecondsInHour = 1000 * 60 * 60;
    const distanceHour = Math.floor(distance / milisecondsInHour);

    if (distanceHour >= 1) {
      return `${distanceHour} hours ago`;
    } else {
      const milisecondsInMinute = 1000 * 60;
      const distanceMinute = Math.floor(distance / milisecondsInMinute);

      if (distanceMinute >= 1) {
        return `${distanceMinute} minutes ago`;
      } else {
        const milisecondsInSeconds = 1000;
        const distanceSeconds = Math.floor(distance / milisecondsInSeconds);
        return `${distanceSeconds} seconds ago`;
      }
    }
  }
}

setInterval(() => {
  renderProjects();
}, 1000);

function renderProjects() {
  let projectsContainer = document.getElementById("contents-projects");

  projectsContainer.innerHTML = "";

  projects.forEach((data) => {
    projectsContainer.innerHTML += `<div class="grid-item" >
                <img src="${data.image}" alt="">
                <div class="title">
                    <h2><a href="project-detail.html"target="_blank" style="text-decoration: none; color: black">${
                      data.title
                    }</a></h2>
                    <p>Durasi : ${data.lengthDateMonths} bulan, ${
      data.lengthDateDays
    } hari.</p>
                </div>
                <div class="title2">
                <p> ${data.description} </p>
                </div>
                <div class="posted">${getDistanceTime(data.postedAt)}</div>
                <div class="tech-icon">
                    ${checkTechLogoifExists(data.logoTechlist)}
                </div>
                <div class="button">
                    <button type="button" onclick="">edit</button>
                    <button type="button" onclick="">delete</button>
                </div>
            </div>`;
  });
}
