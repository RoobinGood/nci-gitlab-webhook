'use strict';

var expect = require('expect.js');
var rewire = require('rewire');
var sinon = require('sinon');

var lib = rewire('../../../lib');
var GitlabWebhook = lib.__get__('GitlabWebhook');

var describeTitle = 'GitlabWebhook.createBuild with merge request webhook';
describe(describeTitle, function() {
	var initialArgs = {
		req: {
			headers: {
				'x-gitlab-event': 'Merge Request Hook'
			},
			body: {
				object_attributes: {
					id: 1,
					iid: 1,
					source_project_id: 1,
					target_project_id: 2,
					source_branch: 'test-branch'
				}
			}
		},
		project: {
			name: 'test-project'
		},
		app: {
			builds: {
				create: sinon.stub()
			}
		}
	};

	it('should return truthy value', function() {
		var webhook = new GitlabWebhook();
		webhook.createBuild(
			initialArgs.req, initialArgs.project, initialArgs.app
		);
	});

	it('initialArgs.app.builds.create should be called 1 time', function() {
		var mock = initialArgs.app.builds.create;

		expect(mock.callCount).equal(1);
	});

	it(
		'initialArgs.app.builds.create should be called with certain params',
		function() {
			var mock = initialArgs.app.builds.create;

			expect(mock.getCall(0).args).eql([{
				projectName: initialArgs.project.name,
				withScmChangesOnly: false,
				queueQueued: true,
				initiator: {
					type: 'gitlab-webhook',
					mergeRequest: {
						id: initialArgs.req.body.object_attributes.id,
						iid: initialArgs.req.body.object_attributes.iid,
						sourceProjectId: initialArgs.req.body.object_attributes
							.source_project_id,
						targetProjectId: initialArgs.req.body.object_attributes
							.target_project_id
					}
				},
				buildParams: {
					scmRev: initialArgs.req.body.object_attributes.source_branch
				}
			}]);
		}
	);
});
