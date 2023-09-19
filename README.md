# Site Checker A.K.A WebWatch

WebWatch is a user-friendly website monitoring app that keeps you informed about the availability of your websites in real-time. Get instant notifications when your site goes down, and celebrate when it's back up.

## Features

- **Instant Updates:** Receive real-time notifications when your website experiences downtime.
- **Effortless Monitoring:** No manual checks required – our app does the monitoring for you.
- **Quick Recovery:** Celebrate when your site is back online with instant notifications.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript,MaterialUI,Bootstrap
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** Sequelize > PostgresSQL
- **Notification:** Email alerts

## Installation

1. Clone the repository: `git clone https://github.com/yourusername/your-repo.git`
2. Navigate to the project directory: `cd your-repo`
3. Install dependencies: `npm install`

## Usage

1. Configure the websites you want to monitor in the `config.json` file.
2. Run the app: `npm start`
3. Get notified about your website's status changes.

## Contributing

Contributions are welcome! If you have any ideas, improvements, or bug fixes, feel free to create a pull request.

## Feedback

If you have any questions, suggestions, or feedback, please open an issue on the GitHub repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**WebWatch Sentinel** - Stay in the know about your website's availability.

Visit the live demo: [Demo Link](https://webwatch.onrender.com)


## Overview
**Problem:**
In today's digital landscape, website downtime and performance issues can lead to missed opportunities and frustrated users. It's challenging to detect these problems in real-time and take swift action.

**Solution:**
WebWatch, your digital guardian, is the answer. This website monitoring application offers real-time tracking and instant alerts, ensuring that you're aware of any disruptions to your online presence. No more lost business due to unexpected downtime.

**My Role:**
As a dedicated junior software developer, I took the reins in crafting the backend functionality of WebWatch. I developed the logic to monitor websites, detect performance dips, and trigger notifications. With a keen eye for detail, I ensured that the monitoring intervals are customizable to fit the unique needs of each user.

**Technologies Utilized:**
WebWatch is built on a solid foundation of JavaScript, leveraging its power for efficient real-time tracking. I incorporated backend technologies such as Node.js for server-side logic and Express.js for creating APIs. Additionally, I used PostgreSQL to manage the data behind the scenes, ensuring a reliable and scalable solution.

**The Impact:**
With WebWatch, clients can rest easy knowing their websites are in safe hands. By offering proactive monitoring, instant alerts, and an intuitive interface, WebWatch enables users to swiftly address issues and keep their online presence thriving. My contribution to WebWatch underscores my commitment to enhancing user experiences and solving real-world problems through software development.

**New 18th Sep 2023**

Added:
    - User can now edit active monitors.(check interval and Group)
    - Most errors are caught gracefully and alerts displayed to clients on realtime.
    - Retry mechanism ( 3 trials for failed requests before sending notifications).
    - User can now upload their avatars.
    - Protection of all routes against CSRF(cross site request forgery).

Fixed:
    - sites with Invalid SSL reporting as unavailable.
    - sites requiring authentication reporting as unavailable.
    - New users unable to assing members to their groups.
    - Errors on creation of user as a member.

Refactored:
    - Break Monitoring algorithm to smaller fuctions that are easy to read and maintain.
    - Notification module is now a simplified class that can be instantiated and imported in any other file.