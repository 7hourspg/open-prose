export namespace api {
	
	export class PreviewState {
	    running: boolean;
	    port: number;
	    url: string;
	    projectDir: string;
	
	    static createFrom(source: any = {}) {
	        return new PreviewState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.running = source["running"];
	        this.port = source["port"];
	        this.url = source["url"];
	        this.projectDir = source["projectDir"];
	    }
	}
	export class ToolchainInfo {
	    node: boolean;
	    nodeVersion: string;
	    npm: boolean;
	    npmVersion: string;
	
	    static createFrom(source: any = {}) {
	        return new ToolchainInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.node = source["node"];
	        this.nodeVersion = source["nodeVersion"];
	        this.npm = source["npm"];
	        this.npmVersion = source["npmVersion"];
	    }
	}

}

export namespace domain {
	
	export class ExportPrefs {
	    lastOutputDir: string;
	
	    static createFrom(source: any = {}) {
	        return new ExportPrefs(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.lastOutputDir = source["lastOutputDir"];
	    }
	}
	export class ExportRequest {
	    projectId: string;
	    outputDir: string;
	    postsOnly?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ExportRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.outputDir = source["outputDir"];
	        this.postsOnly = source["postsOnly"];
	    }
	}
	export class ExportResult {
	    ok: boolean;
	    path: string;
	    posts: number;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new ExportResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ok = source["ok"];
	        this.path = source["path"];
	        this.posts = source["posts"];
	        this.message = source["message"];
	    }
	}
	export class SocialLink {
	    platform: string;
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new SocialLink(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.platform = source["platform"];
	        this.url = source["url"];
	    }
	}
	export class FooterConfig {
	    copyright: string;
	    social: SocialLink[];
	
	    static createFrom(source: any = {}) {
	        return new FooterConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.copyright = source["copyright"];
	        this.social = this.convertValues(source["social"], SocialLink);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class HeaderConfig {
	    tagline: string;
	
	    static createFrom(source: any = {}) {
	        return new HeaderConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tagline = source["tagline"];
	    }
	}
	export class NavLink {
	    label: string;
	    href: string;
	
	    static createFrom(source: any = {}) {
	        return new NavLink(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.label = source["label"];
	        this.href = source["href"];
	    }
	}
	export class Post {
	    id: string;
	    title: string;
	    slug: string;
	    description: string;
	    content: string;
	    tags: string[];
	    coverImage: string;
	    author: string;
	    canonical: string;
	    noIndex: boolean;
	    status: string;
	    position: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Post(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.slug = source["slug"];
	        this.description = source["description"];
	        this.content = source["content"];
	        this.tags = source["tags"];
	        this.coverImage = source["coverImage"];
	        this.author = source["author"];
	        this.canonical = source["canonical"];
	        this.noIndex = source["noIndex"];
	        this.status = source["status"];
	        this.position = source["position"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Theme {
	    template: string;
	
	    static createFrom(source: any = {}) {
	        return new Theme(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.template = source["template"];
	    }
	}
	export class SiteConfig {
	    name: string;
	    url: string;
	    author: string;
	    description: string;
	    icon: string;
	    ogImage: string;
	    locale: string;
	    twitterHandle: string;
	    keywords: string[];
	    organizationName: string;
	    organizationLogo: string;
	
	    static createFrom(source: any = {}) {
	        return new SiteConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.url = source["url"];
	        this.author = source["author"];
	        this.description = source["description"];
	        this.icon = source["icon"];
	        this.ogImage = source["ogImage"];
	        this.locale = source["locale"];
	        this.twitterHandle = source["twitterHandle"];
	        this.keywords = source["keywords"];
	        this.organizationName = source["organizationName"];
	        this.organizationLogo = source["organizationLogo"];
	    }
	}
	export class ProjectMeta {
	    id: string;
	    name: string;
	    template: string;
	    postCount: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	    // Go type: time
	    lastOpened: any;
	
	    static createFrom(source: any = {}) {
	        return new ProjectMeta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.template = source["template"];
	        this.postCount = source["postCount"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	        this.lastOpened = this.convertValues(source["lastOpened"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Project {
	    meta: ProjectMeta;
	    site: SiteConfig;
	    theme: Theme;
	    header: HeaderConfig;
	    footer: FooterConfig;
	    navigation: NavLink[];
	    aboutContent: string;
	    homeContent: string;
	    homeShowRecent: boolean;
	    homeRecentCount: number;
	    posts: Post[];
	    export: ExportPrefs;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.meta = this.convertValues(source["meta"], ProjectMeta);
	        this.site = this.convertValues(source["site"], SiteConfig);
	        this.theme = this.convertValues(source["theme"], Theme);
	        this.header = this.convertValues(source["header"], HeaderConfig);
	        this.footer = this.convertValues(source["footer"], FooterConfig);
	        this.navigation = this.convertValues(source["navigation"], NavLink);
	        this.aboutContent = source["aboutContent"];
	        this.homeContent = source["homeContent"];
	        this.homeShowRecent = source["homeShowRecent"];
	        this.homeRecentCount = source["homeRecentCount"];
	        this.posts = this.convertValues(source["posts"], Post);
	        this.export = this.convertValues(source["export"], ExportPrefs);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	export class TemplateInfo {
	    id: string;
	    name: string;
	    description: string;
	    accent: string;
	
	    static createFrom(source: any = {}) {
	        return new TemplateInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.accent = source["accent"];
	    }
	}

}

