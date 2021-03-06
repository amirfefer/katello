import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { orgId } from '../../services/api';
import SetOrganization from '../SelectOrg/SetOrganization';
import titleWithCaret from '../../helpers/caret';
import Header from '../../containers/Application/Headers';

function withOrganization(WrappedComponent, redirectPath) {
  class CheckOrg extends Component {
    componentDidUpdate(prevProps) {
      const { location } = this.props;

      // TODO: use topbar react component
      const orgTitle = location.state && location.state.orgChanged;
      const prevOrgTitle = prevProps.location.state && prevProps.location.state.orgChanged;

      if (orgTitle !== prevOrgTitle) {
        document.getElementById('organization-dropdown').children[0].innerHTML = titleWithCaret(orgTitle);
      }
    }

    render() {
      if (!orgId()) {
        return (
          <React.Fragment>
            <Header title={__('Select Organization')} />
            <SetOrganization redirectPath={redirectPath} />
          </React.Fragment>
        );
      }
      return <WrappedComponent {...this.props} />;
    }
  }

  CheckOrg.propTypes = {
    location: PropTypes.shape({}).isRequired,
  };

  return CheckOrg;
}

export default withOrganization;
