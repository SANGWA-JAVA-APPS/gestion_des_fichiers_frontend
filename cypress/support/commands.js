const mockUserInfo = {
	userId: 1,
	username: 'mamadou',
	fullName: 'Mamadou FALL',
	email: 'mamadou@example.com',
	role: 'ADMIN',
	locationEntityId: 1,
	locationEntityName: 'MAGERWA',
	countryName: 'Rwanda',
	countryIsoCode: 'RWA',
	countryFlagUrl: 'https://flagcdn.com/w40/rw.png',
	permissions: [
		{ id: 2, name: 'Norms and Laws', code: 'NORME_LOI', blockName: 'Norms, Laws and Regulation' },
		{ id: 3, name: 'Asset Land', code: 'COMM_ASSET_LAND', blockName: 'Asset Land' },
		{ id: 4, name: 'Construction Permits', code: 'PERMI_CONSTRUCTION', blockName: 'Asset Land' },
		{ id: 5, name: 'Concession Agreement', code: 'ACCORD_CONCESSION', blockName: 'Asset Land' },
		{ id: 6, name: 'Estate', code: 'ESTATE', blockName: 'Asset Estate' },
		{ id: 7, name: 'Certificates & Licenses', code: 'CERT_LICENSES', blockName: 'Certificates et Licences' },
		{ id: 8, name: 'Cargo Damage', code: 'CARGO_DAMAGE', blockName: 'Third Party Contracts' },
		{ id: 9, name: 'Financial Policies', code: 'DOC_FINANCIAL', blockName: 'Companies Policies (Similar)' },
		{ id: 10, name: 'Procurement Policies', code: 'DOC_PROCUREMENT', blockName: 'Companies Policies (Similar)' },
		{ id: 11, name: 'HR Policies', code: 'DOC_HR', blockName: 'Companies Policies (Similar)' },
		{ id: 12, name: 'Technical Policies', code: 'DOC_TECHNICAL', blockName: 'Companies Policies (Similar)' },
		{ id: 13, name: 'IT Policies', code: 'DOC_IT', blockName: 'Companies Policies (Similar)' },
		{ id: 14, name: 'Real Estate Policies', code: 'DOC_REAL_ESTATE', blockName: 'Companies Policies (Similar)' },
		{ id: 15, name: 'Shareholders Policies', code: 'DOC_SHAREHOLDERS', blockName: 'Companies Policies (Similar)' },
		{ id: 16, name: 'Legal Policies', code: 'DOC_LEGAL', blockName: 'Companies Policies (Similar)' },
		{ id: 17, name: 'Quality Policies', code: 'DOC_QUALITY', blockName: 'HSE Policies' },
		{ id: 18, name: 'HSE Policies', code: 'DOC_HSE', blockName: 'HSE Policies' },
		{ id: 19, name: 'Equipment Policies', code: 'DOC_EQUIPMENT', blockName: 'HSE Policies' },
		{ id: 20, name: 'Drug & Alcohol Policies', code: 'DOC_DRUG_ALCOHOL', blockName: 'HSE Policies' },
		{ id: 21, name: 'Incident Newsletters', code: 'DOC_INCIDENT', blockName: 'HSE Policies' },
		{ id: 22, name: 'SOP', code: 'DOC_SOP', blockName: 'HSE Policies' },
		{ id: 23, name: 'Suppliers Contracts', code: 'DOC_SUPPLIERS', blockName: 'Third Party Contracts' },
		{ id: 24, name: 'Rental Assets Contracts', code: 'DOC_RENTAL_CONTRACTS', blockName: 'Third Party Contracts' },
		{ id: 25, name: 'Client Commercial Contracts', code: 'DOC_CLIENT_COMMERCIAL', blockName: 'Third Party Contracts' },
		{ id: 26, name: 'Rental Assets', code: 'DOC_RENTAL_ASSETS', blockName: 'Third Party Contracts' },
		{ id: 27, name: 'Doc Status', code: 'DOC_STATUS', blockName: 'Settings' }
	]
}

Cypress.Commands.add('mockLoginApi', () => {
	cy.intercept('POST', '**/api/auth/login', {
		statusCode: 200,
		body: {
			success: true,
			message: 'Login successful',
			token: 'fake-jwt-token',
			refreshToken: 'fake-refresh-token',
			account: {
				id: mockUserInfo.userId,
				username: mockUserInfo.username,
				fullName: mockUserInfo.fullName,
				email: mockUserInfo.email,
				categoryName: mockUserInfo.role,
				locationEntityId: mockUserInfo.locationEntityId,
				locationEntityName: mockUserInfo.locationEntityName,
				countryName: mockUserInfo.countryName,
				countryIsoCode: mockUserInfo.countryIsoCode,
				countryFlagUrl: mockUserInfo.countryFlagUrl,
				permissions: mockUserInfo.permissions
			}
		}
	}).as('loginRequest')
})

Cypress.Commands.add('mockAppApis', () => {
	cy.intercept('GET', '**/api/dashboard/stats*', {
		statusCode: 200,
		body: {
			users: { totalUsers: 2, activeUsers: 2, inactiveUsers: 0 },
			locations: { totalCountries: 1, totalEntities: 1, totalModules: 0, totalSections: 0 },
			system: { serverStatus: 'ONLINE', timestamp: Date.now() }
		}
	}).as('getDashboardStats')

	cy.intercept('GET', '**/api/dashboard/storage*', {
		statusCode: 200,
		body: { totalBytes: 2097152 }
	}).as('getDashboardStorage')

	cy.intercept('GET', '**/api/accounts*', {
		statusCode: 200,
		body: {
			data: [
				{
					id: 1,
					username: 'mamadou',
					fullName: 'Mamadou FALL',
					email: 'mamadou@example.com',
					phoneNumber: '0788000000',
					categoryName: 'ADMIN',
					countryName: 'Rwanda',
					locationEntityName: 'MAGERWA',
					active: true
				}
			],
			pagination: {
				currentPage: 0,
				totalPages: 1,
				totalElements: 1,
				pageSize: 20
			}
		}
	}).as('getAccounts')

	cy.intercept('GET', '**/api/location/countries*', {
		statusCode: 200,
		body: {
			data: [
				{
					id: 1,
					name: 'Rwanda',
					isoCode: 'RWA',
					phoneCode: '+250',
					flagUrl: 'https://flagcdn.com/w40/rw.png',
					description: 'Rwanda',
					active: true
				}
			],
			pagination: {
				currentPage: 0,
				totalPages: 1,
				totalElements: 1,
				pageSize: 20
			}
		}
	}).as('getCountries')

	cy.intercept('GET', '**/api/location/entities*', {
		statusCode: 200,
		body: {
			data: [
				{
					id: 1,
					name: 'MAGERWA',
					countryId: 1,
					countryName: 'Rwanda',
					active: true
				}
			],
			pagination: {
				currentPage: 0,
				totalPages: 1,
				totalElements: 1,
				pageSize: 20
			}
		}
	}).as('getEntities')

	cy.intercept('GET', '**/api/location/modules*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getModules')

	cy.intercept('GET', '**/api/location/sections*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getSections')

	cy.intercept('GET', '**/api/account-categories*', {
		statusCode: 200,
		body: {
			data: [
				{ id: 1, name: 'ADMIN' },
				{ id: 2, name: 'USER' }
			]
		}
	}).as('getAccountCategories')

	cy.intercept('GET', '**/api/roles*', {
		statusCode: 200,
		body: {
			data: [
				{ id: 1, name: 'ADMIN', description: 'Administrator' },
				{ id: 2, name: 'USER', description: 'User' }
			],
			pagination: {
				currentPage: 0,
				totalPages: 1,
				totalElements: 2,
				pageSize: 20
			}
		}
	}).as('getRoles')

	cy.intercept('GET', '**/api/document/reporting/summary*', {
		statusCode: 200,
		body: {
			data: {
				totalCountries: 1,
				countriesWithNoEntities: 0,
				totalEntities: 1,
				totalFiles: 4,
				totalDocRecords: 4,
				documentsWithoutFileLink: 0,
				documentsMissingStatus: 0,
				filesMissingExpiration: 0
			}
		}
	}).as('getReportingSummary')

	cy.intercept('GET', '**/api/document/reporting/document-types*', {
		statusCode: 200,
		body: {
			data: [
				{ docType: 'norme_loi', total: 2 },
				{ docType: 'common_doc_details', total: 1 }
			]
		}
	}).as('getDocumentTypes')

	cy.intercept('GET', '**/api/document/reporting/file-status*', {
		statusCode: 200,
		body: {
			data: [
				{ status: 'ACTIVE', total: 4 }
			]
		}
	}).as('getFileStatuses')

	cy.intercept('GET', '**/api/document/reporting/document-type-sizes*', {
		statusCode: 200,
		body: {
			data: [
				{ docType: 'norme_loi', totalBytes: 1048576 },
				{ docType: 'common_doc_details', totalBytes: 1048576 }
			]
		}
	}).as('getTypeSizes')

	cy.intercept('GET', '**/api/document/doc-status*', {
		statusCode: 200,
		body: {
			data: [
				{ id: 1, name: 'In Progress', active: true },
				{ id: 2, name: 'Validated', active: true }
			],
			pagination: {
				currentPage: 0,
				totalPages: 1,
				totalElements: 2,
				pageSize: 20
			}
		}
	}).as('getDocStatus')

	cy.intercept('GET', '**/api/document/section-category/code/*', {
		statusCode: 200,
		body: {
			success: true,
			data: {
				id: 1,
				code: 'ORG_FIN',
				name: 'Financial'
			}
		}
	}).as('getSectionCategoryByCode')

	cy.intercept('GET', '**/api/document/section-category*', {
		statusCode: 200,
		body: {
			data: [
				{ id: 1, code: 'ORG_FIN', name: 'Financial', active: true },
				{ id: 2, code: 'ORG_PROC', name: 'Procurement', active: true }
			],
			pagination: {
				currentPage: 0,
				totalPages: 1,
				totalElements: 2,
				pageSize: 20
			}
		}
	}).as('getSectionCategories')

	cy.intercept('GET', '**/api/document/norme-loi*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getNormeLoi')

	cy.intercept('GET', '**/api/document/comm-asset-land*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getCommAssetLand')

	cy.intercept('GET', '**/api/document/permi-construction*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getPermiConstruction')

	cy.intercept('GET', '**/api/document/accord-concession*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getAccordConcession')

	cy.intercept('GET', '**/api/document/estate*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getEstate')

	cy.intercept('GET', '**/api/document/cert-licenses*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getCertLicenses')

	cy.intercept('GET', '**/api/document/cargo-damage*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getCargoDamage')

	cy.intercept('GET', '**/api/document/common-doc-details*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getCommonDocDetails')

	cy.intercept('GET', '**/api/document/comm-third-party*', {
		statusCode: 200,
		body: {
			data: [],
			pagination: {
				currentPage: 0,
				totalPages: 0,
				totalElements: 0,
				pageSize: 20
			}
		}
	}).as('getCommThirdParty')
})

Cypress.Commands.add('visitAuthed', (path = '/dashboard', overrides = {}) => {
	const userInfo = {
		...mockUserInfo,
		...overrides
	}

	cy.visit(path, {
		onBeforeLoad(win) {
			win.localStorage.setItem('authToken', 'fake-jwt-token')
			win.localStorage.setItem('refreshToken', 'fake-refresh-token')
			win.localStorage.setItem('userInfo', JSON.stringify(userInfo))
		}
	})
})

Cypress.Commands.add('loginThroughUi', (username = 'mamadou', password = 'password123') => {
	cy.mockLoginApi()
	cy.visit('/login')
	cy.get('input[name="username"]').clear().type(username)
	cy.get('input[name="password"]').clear().type(password)
	cy.get('button[type="submit"]').click()
	cy.wait('@loginRequest')
})