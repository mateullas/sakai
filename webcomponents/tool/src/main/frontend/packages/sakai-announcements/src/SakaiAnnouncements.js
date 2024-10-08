import { css, html, nothing } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import "@sakai-ui/sakai-icon";
import { SakaiPageableElement } from "@sakai-ui/sakai-pageable-element";
import { SakaiSitePicker } from "@sakai-ui/sakai-site-picker";
import "@sakai-ui/sakai-site-picker/sakai-site-picker.js";

export class SakaiAnnouncements extends SakaiPageableElement {

  constructor() {

    super();

    this.showPager = true;
    this.loadTranslations("announcements").then(r => this.i18n = r);
  }

  set data(value) {

    this._data = value;

    if (!this.siteId) {

      this._sites = [];
      const done = [];
      this._data.forEach(a => {

        a.visible = true;
        if (!done.includes(a.siteTitle)) {
          this._sites.push({ siteId: a.siteId, title: a.siteTitle });
          done.push(a.siteTitle);
        }
      });
    }
  }

  get data() { return this._data; }

  async loadAllData() {

    const url = this.siteId ? `/api/sites/${this.siteId}/announcements`
      : "/api/users/me/announcements";

    return fetch(url)
      .then(r => {

        if (r.ok) {
          return r.json();
        }
        throw new Error(`Failed to get announcements from ${url}`);

      })
      .then(data => this.data = data)
      .catch (error => console.error(error));
  }

  _sitesSelected(e) {

    if (e.detail.value === SakaiSitePicker.ALL) {
      this.data.forEach(a => a.visible = true);
    } else {
      this.data.forEach(a => a.visible = a.siteId === e.detail.value);
    }
    this.requestUpdate();
  }

  sortByTitle() {

    if (this.sortTitle === "AZ") {
      this.data.sort((a1, a2) => a1.subject.localeCompare(a2.subject));
      this.sortTitle = "ZA";
    } else {
      this.data.sort((a1, a2) => a2.subject.localeCompare(a1.subject));
      this.sortTitle = "AZ";
    }
    this.repage();
  }

  sortBySite() {

    if (this.sortSite === "AZ") {
      this.data.sort((a1, a2) => a1.siteTitle.localeCompare(a2.siteTitle));
      this.sortSite = "ZA";
    } else {
      this.data.sort((a1, a2) => a2.siteTitle.localeCompare(a1.siteTitle));
      this.sortSite = "AZ";
    }
    this.repage();
  }

  content() {

    return html`
      ${!this.siteId ? html`
      <div id="site-filter">
        <sakai-site-picker
            .sites=${this._sites}
            @sites-selected=${this._sitesSelected}>
        </sakai-site-picker>
      </div>
      ` : nothing}
      <div id="viewing">${this.i18n.viewing}</div>
      <div class="announcements ${!this.siteId || this.siteId === "home" ? "home" : "course"}">
        <div class="header">
          <a href="javascript:;"
              title="${this.i18n.sort_by_title_tooltip}"
              aria-label="${this.i18n.sort_by_title_tooltip}"
              @click=${this.sortByTitle}>
            ${this.i18n.title}
          </a>
        </div>
        ${!this.siteId || this.siteId === "home" ? html`
          <div class="header">
            <a href="javascript:;"
                title="${this.i18n.sort_by_site_tooltip}"
                aria-label="${this.i18n.sort_by_site_tooltip}"
                @click=${this.sortBySite}>
              ${this.i18n.site}
            </a>
          </div>
        ` : nothing}
        <div class="header">${this.i18n.view}</div>
      ${this.dataPage.filter(a => a.visible).map((a, i) => html`
        <div class="title cell ${i % 2 === 0 ? "even" : "odd"}">
          ${a.highlighted ? html`
          <sakai-icon type="favourite" size="small"></sakai-icon>
          ` : nothing}
          <span class="${ifDefined(a.highlighted ? "highlighted" : undefined)}">${a.subject}</span>
        </div>
        ${!this.siteId || this.siteId === "home" ? html`
          <div class="site cell ${i % 2 === 0 ? "even" : "odd"}">${a.siteTitle}</div>
        ` : nothing}
        <div class="url cell ${i % 2 === 0 ? "even" : "odd"}">
          <a href="${a.url}"
              title="${this.i18n.url_tooltip}"
              aria-label="${this.i18n.url_tooltip}">
            <sakai-icon type="right" size="small"></sakai-icon>
          </a>
        </div>
      `)}
      </div>
    `;
  }

  static styles = [
    SakaiPageableElement.styles,
    css`
      a {
        color: var(--link-color);
      }
      a:hover { 
        color: var(--link-hover-color);
      }
      a:active {
        color: var(--link-active-color);
      }
      a:visited {
        color: var(--link-visited-color);
      }

      #site-filter {
      margin-bottom: 12px;
      }
      #filter {
        flex: 1;
      }
      #viewing {
        margin-bottom: 20px;
        font-size: var(--sakai-grades-title-font-size, 14px);
      }
      .announcements {
        display:grid;
        grid-auto-rows: minmax(10px, auto);
      }

      .home {
        grid-template-columns: 4fr 1fr 0fr;
      }

      .course {
        grid-template-columns: 4fr 0fr;
      }
        .announcements > div:nth-child(-n+3) {
          padding-bottom: 14px;
        }
        .header {
          font-weight: bold;
          padding: 0 5px 0 5px;
        }
          .header a {
            text-decoration: none;
            color: var(--sakai-text-color-1, #000);
          }
        .title {
          flex: 2;
        }
        .cell {
          display: flex;
          align-items: center;
          padding: 8px;
          font-size: var(--sakai-grades-title-font-size);
        }
        .even {
          background-color: var(--sakai-table-even-color);
        }
        .site {
          flex: 1;
        }
        .url {
          flex: 1;
        }
    `,
  ];
}
