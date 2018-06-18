import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Tabs, Tab, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { bindMethods, Button, Icon, Modal, Spinner, OverlayTrigger, Tooltip } from 'patternfly-react';
import TooltipButton from 'react-bootstrap-tooltip-button';
import { Table } from '../../../move_to_foreman/components/common/table';
import { columns } from './ManifestHistoryTableSchema';
import ConfirmDialog from '../../../move_to_foreman/components/common/ConfirmDialog';
import DeleteManifestModalText from './DeleteManifestModalText';
import {
  BLOCKING_FOREMAN_TASK_TYPES,
  MANIFEST_TASKS_BULK_SEARCH_ID,
} from '../SubscriptionConstants';

class ManageManifestModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: props.showModal,
      actionInProgress: props.taskInProgress,
      showDeleteManifestModalDialog: false,
    };

    bindMethods(this, [
      'hideModal',
      'saveOrganization',
      'uploadManifest',
      'refreshManifest',
      'deleteManifest',
      'manifestExists',
      'disabledTooltipText',
    ]);
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillReceiveProps(props) {
    this.setState({ showModal: props.showModal });
    this.setState({ actionInProgress: props.taskInProgress });
  }

  componentDidUpdate(prevProp, prevState) {
    const { actionInProgress } = this.state;

    if (prevState.actionInProgress && !actionInProgress) {
      this.props.loadOrganization();
    }
  }

  loadData() {
    this.props.loadManifestHistory();
  }

  hideModal() {
    this.setState({ showModal: false, showDeleteManifestModalDialog: false });
    this.props.onClose();
  }

  saveOrganization(event) {
    this.props.saveOrganization({ redhat_repository_url: event.target.value });
  }

  uploadManifest(fileList) {
    this.setState({ actionInProgress: true });
    if (fileList.length > 0) {
      this.props.uploadManifest(fileList[0]);
    }
  }

  refreshManifest() {
    this.props.refreshManifest();
    this.setState({ actionInProgress: true });
  }

  deleteManifest() {
    this.setState({ actionInProgress: true });
    this.props.deleteManifest()
      .then(() =>
        this.props.bulkSearch({
          search_id: MANIFEST_TASKS_BULK_SEARCH_ID,
          type: 'all',
          active_only: true,
          action_types: BLOCKING_FOREMAN_TASK_TYPES,
        }));
    this.showDeleteManifestModal(false);
  }

  showDeleteManifestModal(show) {
    this.setState({
      showDeleteManifestModalDialog: show,
    });
  }

  disabledTooltipText() {
    if (this.state.actionInProgress) {
      return __('This is disabled because a manifest task is in progress');
    }
    return __('This is disabled because no manifest exists');
  }

  manifestExists() {
    const { organization } = this.props;

    return organization.owner_details && organization.owner_details.upstreamConsumer;
  }

  render() {
    const {
      manifestHistory, organization, disableManifestActions, disabledReason,
    } = this.props;

    const { actionInProgress } = this.state;

    const emptyStateData = () => ({
      header: __('There is no Manifest History to display.'),
      description: __('Import a Manifest using the manifest tab above.'),
      documentation: {
        title: __('Learn more about adding Subscription Manifests'),
        url: 'http://redhat.com',
      },
    });

    const getManifestName = () => {
      let name = __('No Manifest Uploaded');

      if (organization.owner_details && organization.owner_details.upstreamConsumer) {
        const link = ['https://', organization.owner_details.upstreamConsumer.webUrl,
          organization.owner_details.upstreamConsumer.uuid].join('/');

        name = (
          <a href={link}>{organization.owner_details.upstreamConsumer.name}</a>
        );
      }

      return name;
    };

    return (
      <Modal show={this.state.showModal} onHide={this.hideModal}>
        <Modal.Header>
          <button className="close" onClick={this.hideModal} aria-label={__('Close')}>
            <Icon type="pf" name="close" />
          </button>
          <Modal.Title>{__('Manage Manifest')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs id="manifest-history-tabs">
            <Tab eventKey={1} title={__('Manifest')}>
              <Form className="form-horizontal">
                <h5>{__('Red Hat Provider Details')}</h5>
                <hr />
                <FormGroup>
                  <ControlLabel className="col-sm-3" htmlFor="cdnUrl">
                    {__('Red Hat CDN URL')}
                  </ControlLabel>
                  <Col sm={9}>
                    <FormControl
                      id="cdnUrl"
                      type="text"
                      value={organization.redhat_repository_url || ''}
                      onChange={this.saveOrganization}
                    />
                  </Col>
                </FormGroup>
                <br />

                <h5>{__('Subscription Manifest')}</h5>
                <hr />

                <FormGroup>
                  <ControlLabel className="col-sm-3 control-label" htmlFor="usmaFile">
                    <OverlayTrigger
                      overlay={
                        <Tooltip id="usma-tooltip">{__('Upstream Subscription Management Application')}</Tooltip>
                        }
                      placement="bottom"
                      trigger={['hover', 'focus']}
                      rootClose={false}
                    >
                      <span>{__('USMA')}</span>
                    </OverlayTrigger>
                  </ControlLabel>

                  <Col sm={9} className="manifest-actions">
                    <Spinner loading={actionInProgress} inline />

                    {getManifestName()}

                    <FormControl
                      id="usmaFile"
                      type="file"
                      accept=".zip"
                      disabled={actionInProgress}
                      onChange={e => this.uploadManifest(e.target.files)}
                    />

                    <TooltipButton
                      onClick={this.refreshManifest}
                      tooltipId="refresh-manifest-button-tooltip"
                      tooltipText={disabledReason}
                      tooltipPlacement="top"
                      title={__('Refresh')}
                      disabled={!this.manifestExists() ||
                        actionInProgress || disableManifestActions}
                    />

                    <TooltipButton
                      onClick={() => this.showDeleteManifestModal(true)}
                      tooltipId="delete-manifest-button-tooltip"
                      tooltipText={this.disabledTooltipText()}
                      tooltipPlacement="top"
                      title={__('Delete')}
                      disabled={!this.manifestExists() || actionInProgress}
                    />

                    <ConfirmDialog
                      show={this.state.showDeleteManifestModalDialog}
                      title={__('Confirm delete manifest')}
                      dangerouslySetInnerHTML={{
                        __html: DeleteManifestModalText,
                      }}
                      confirmLabel={__('Delete')}
                      confirmStyle="danger"
                      onConfirm={() => this.deleteManifest()}
                      onCancel={() => this.showDeleteManifestModal(false)}
                    />
                  </Col>
                </FormGroup>
              </Form>
            </Tab>

            <Tab eventKey={2} title={__('Manifest History')}>
              <Spinner loading={manifestHistory.loading} className="small-spacer">
                <Table
                  rows={manifestHistory.results}
                  columns={columns}
                  emptyState={emptyStateData()}
                />
              </Spinner>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.hideModal}>
            {__('Close')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ManageManifestModal.propTypes = {
  uploadManifest: PropTypes.func.isRequired,
  refreshManifest: PropTypes.func.isRequired,
  deleteManifest: PropTypes.func.isRequired,
  loadManifestHistory: PropTypes.func.isRequired,
  organization: PropTypes.shape({}).isRequired,
  disableManifestActions: PropTypes.bool,
  disabledReason: PropTypes.string,
  loadOrganization: PropTypes.func.isRequired,
  saveOrganization: PropTypes.func.isRequired,
  taskInProgress: PropTypes.bool.isRequired,
  manifestHistory: PropTypes.shape({}).isRequired,
  showModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  bulkSearch: PropTypes.func.isRequired,
};

ManageManifestModal.defaultProps = {
  disableManifestActions: false,
  disabledReason: '',
  onClose() {},
};

export default ManageManifestModal;
