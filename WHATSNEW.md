Version: **0.26.0** [2024/03/24]

New Features:
  - Supported back and forward buttons on browser
  - Supported docker build with multi-stage builds

Enhanced Features:
  - Changed default value of displaynig rows to 1000
  - Automatically close modal window after creating project or uploading

Bug Fixes:
  - Unvisibling date button on functinal table is still enabled when multi files are opened
  - cache data remains after deleting bundle
  -  Workaround for error in xterm.js

***

Version: **0.25.0** [2023/09/06]

New Features:
  - Supported simultaneously opening two files on the viewer

Enhanced Features:
  - Updated the way to display the values of array in table

Bug Fixes:
  - author is blank
  - checkbox for presering is still changeble during uploading
  - cannot preserve the search condition in url

***

Version: **0.24.0** [2022/10/05]

New Features:
  - Node 10 and Python 2.7 are out of support

Enhanced Features:
  - Supported to get nonzero and vitality counters

Bug Fixes:
  - Specific server timeout is defined
  - Viewer crashed after opening large file
  - File search aborts with large file in log bundle
  - cannot build costom fonts of pdfmake
  - Updated vulnerary modules

***

Version: **0.23.0** [2022/03/07]

New Features:
  - Supported viewing performance chart

Bug Fixes:
  - wrong compatibility of project.inf
  - wrong log bundle type detected after posting log bundle
  - Vulnerary modules

***

Version: **0.22.0** [2022/01/26]

New Features:
  - *None*

Enhanced Features:
  - Modified codes for future versions

Bug Fixes:
  - *None*

***

Version: **0.21.0** [2022/01/21]

New Features:
  - Supported uploading zip file

Enhanced Features:
  - Added get started

Bug Fixes:
  - Unexpected delete of preserved log bundle after closing/re-opening project
  - Unexpected screen transition
  - Unexpected cleaning of terminal after changing tab
  - Vulnerary modules

***

Version: **0.20.0** [2022/01/14]

New Features:
  - *None*

Enhanced Features:
  - Supported to resize for terminal
  - Supported to hide left pane

Bug Fixes:
  - socket.io session was unintentionally disconnected
  - Cannot open file by legacy view

***

Version: **0.19.0** [2022/01/12]

New Features:
  - Supported CLI console

Enhanced Features:
  - Added terminal tab
  - Supported prev/next buttons on functional table with mark
  - Supported url preserving for mark

Bug Fixes:
  - Invalid mode is selected in search operation on functinal table

***

Version: **0.18.0** [2021/11/06]

New Features:
  - *None*

Enhanced Features:
  - Modified layout of functional table

Bug Fixes:
  - Vulnerary modules

***

Version: **0.17.0** [2021/11/03]

New Features:
  - Supported to invite a guest user

Enhanced Features:
  - Supported prev/next buttons on functional table with highlight

Bug Fixes:
  - Unnecessary button is displayed on bundle download window

***

Version: **0.16.0** [2021/10/14]

New Features:
  - Supported preserving and downloading the original log file

Bug Fixes:
  - *None*

***

Version: **0.15.0** [2021/10/01]

New Features:
  - Supported temporary marking and filter on viewer

Enhanced Features:
  - Supported to automatically open project or log bundle after creating or uploading

Bug Fixes:
  - Vulnerary modules

***

Version: **0.14.0** [2021/09/29]

New Features:
  - *None*

Enhanced Features:
  - Updated file search function

Bug Fixes:
  - Vulnerary modules

***

Version: **0.13.0** [2021/08/10]

New Features:
  - Supported file search by date

Enhanced Features:
  - Supported compressed data transmission
  - Supported reloading on viewer to switch date column

Bug Fixes:
  - Unexpected lines displayed on viewer with date filter
  - Vulnerary modules

***

Version: **0.12.0** [2021/03/20]

New Features:
  - Supported anonymous user
  - Supported creating PDF document

Enhanced Features:
  - Supported updating page title
  - Supported caching for getting a file list
  - Supported submitting by Enter key in input box

Bug Fixes:
  - Fell into race condition in updating info file
  - Vulnerary modules

***

Version: **0.11.0** [2020/11/29]

New Features:
  - Supported downloading filtered contents on viewer
  - Supported converting date to local time on viewer

Enhanced Features:
  - Supported preserving sensitivity of text filter

Bug Fixes:
  - Failed in uploading a renamed log bundle

***

Version: **0.10.0** [2020/11/19]

New Features:
  - *None*

Enhanced Features:
  - Supported recording project closed date

Bug Fixes:
  - unexpected table layout on Firefox
  - a request with multiple queries cannot be forwarded via error/login page
  - unexpected result of search files

***

Version: **0.9.0** [2020/11/05]

New Features:
  - *None*

Enhanced Features:
  - Improved layout

Bug Fixes:
  - project/bundle list was not cleared on access error
  - resources with symbol cannot be accessed
  - page is crashed on launching project select modal

***

Version: **0.8.0** [2020/11/01]

New Features:
  - Supported date filter on viewer
  - Supported any additional domain

Enhanced Features:
  - Improved project/bundle select view
  - Changed being able to delete project/bundle on public domain
  - Supported adding a new user on command line
  - Added logout button on main page

Bug Fixes:
  - *None*

***

Version: **0.7.x** [2020/10/29]

Enhanced Features:
  - Updated [Host] and [VM] tab

***

Version: **0.7.0** [2020/10/27]

New Features:
  - *None*

Enhanced Features:
  - Top page link on LOGO
  - Pop-upable **What's New**

Bug Fixes:
  - Table contents is not displayed in case of both line and filter params in URL

***

Version: **0.6.x** [2020/10/25]

New Features:
  - **vmkernel-zdump** information display

Bug Fixes:
  - *None*

***

Version: **0.6.0** [2020/10/25]

New Features:
  - **What's New** information display
  - File search
  - Project management (open/close)

Enhanced Features:
  - Text filter on viewer can be preserved in URL

Bug Fixes:
  - *None*
